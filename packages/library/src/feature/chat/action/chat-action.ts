import { convertToModelMessages, createGateway, stepCountIs, ToolLoopAgent } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { ActionFunctionArgs } from "react-router";
import { verifySession } from "../../../auth/auth.server.js";
import { RoleEnum } from "../../../enum/RoleEnum.js";
import { dbConnect } from "../../../database/mongoose.server.js";
import { getActiveSubscriptionsFromMongo } from "../../payment/utils/syncSubscription.server.js";
import ProModelUsageRecord from "../../../models/ProModelUsageRecord.js";
import {
    discoverSkills,
    buildSkillsCatalog,
    createSkillTools,
    generateAudio,
    generate_passage,
    generateImage,
    perplexity_web_search,
    read_editor_content,
    insert_editor_content,
    proofread_exercise,
    plan_dse_reading,
} from "../../../ai/index.js";
import { ChatMode, OptionalToolId, ALL_OPTIONAL_TOOL_IDS, getSystemPrompt } from "./../../chat/chat-modes";
import { ModelId, DEFAULT_MODEL, FREE_MODEL_IDS, PAID_MODEL_IDS, MODEL_OPTIONS } from "./../../chat/chat-models";

// Monthly quota limits for pro model usage
const FREE_TIER_PRO_MODEL_LIMIT = 10; // Free tier users: 10 pro model uses per month
const PAID_TIER_PRO_MODEL_LIMIT = Infinity; // Paid subscribers: unlimited

const TOOL_REGISTRY: Record<string, unknown> = {
    perplexity_web_search,
    generateAudio,
    generate_passage,
    generateImage,
};

/**
 * Resolves the correct language model instance based on the requested model ID.
 *
 * Free models → Azure AI provider (gpt-5-mini, deepseek-v3)
 * Paid models → Vercel AI Gateway (gemini-3.0-pro, claude-sonnet-4-5)
 *
 * Tier enforcement happens in chatAction before this is called — admin or active
 * Stripe subscribers may request paid models; all others receive a 403.
 */
function resolveModel(modelId: ModelId) {
    const option = MODEL_OPTIONS.find((m) => m.id === modelId);
    if (!option) throw new Error(`Unknown model: ${modelId}`);

    if (FREE_MODEL_IDS.includes(modelId)) {
        // Azure provider for free-tier models
        // Required env vars: AZURE_OPENAI_API_KEY, AZURE_OPENAI_RESOURCE_NAME
        // Each model must have a matching deployment in Azure AI Studio.

        const azure = createAzure({
            apiKey: process.env.AZURE_OPENAI_API_KEY!,
            resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME!,
        });
        return azure.chat(option.azureDeployment!);
    }

    // Paid models via Vercel AI gateway
    const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY! });
    return gateway.languageModel(option.gatewayId!);
}

export async function chatAction({ request }: ActionFunctionArgs) {
    try {
        const {
            messages,
            mode = "education" as ChatMode,
            selectedTools = ALL_OPTIONAL_TOOL_IDS as OptionalToolId[],
            selectedSkills = [] as string[],
            selectedModel = DEFAULT_MODEL as ModelId,
        } = await request.json();

        // Derive proofreadEnabled from selectedTools
        const proofreadEnabled = selectedTools.includes("proofread_exercise");

        // Server-side tier enforcement: check if user can use paid models
        if (PAID_MODEL_IDS.includes(selectedModel)) {
            const { user } = await verifySession(request);
            const isAdmin = user?.roles?.includes(RoleEnum.ADMIN) ?? false;

            // Admins bypass quota checks
            if (!isAdmin) {
                await dbConnect("inst-acessment");
                const activeSubs = await getActiveSubscriptionsFromMongo(user?.id ?? "");
                const isPro = activeSubs.length > 0;

                // Determine quota based on subscription status
                const monthlyLimit = isPro ? PAID_TIER_PRO_MODEL_LIMIT : FREE_TIER_PRO_MODEL_LIMIT;

                // Get current month usage
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                const usage = await ProModelUsageRecord.findOne({
                    userId: user?.id,
                    year,
                    month,
                });

                const currentCount = usage?.count || 0;

                // Check if limit reached
                if (currentCount >= monthlyLimit) {
                    // Free tier users hit paywall
                    if (!isPro) {
                        return new Response(
                            JSON.stringify({
                                error: "Free tier pro model limit reached",
                                message: `You have reached your free tier limit of ${FREE_TIER_PRO_MODEL_LIMIT} pro model uses per month. Upgrade to premium for unlimited access.`,
                                limit: FREE_TIER_PRO_MODEL_LIMIT,
                                current: currentCount,
                                year,
                                month,
                                isPremium: false,
                                requiresUpgrade: true,
                                upgradeUrl: "/payment",
                            }),
                            {
                                status: 402, // 402 Payment Required (paywall)
                                headers: { "Content-Type": "application/json" },
                            }
                        );
                    }
                    // Paid users (shouldn't reach here with Infinity limit, but safety check)
                    return new Response(
                        JSON.stringify({
                            error: "Monthly pro model limit reached",
                            message: `You have reached your monthly limit of ${monthlyLimit} pro model uses.`,
                            limit: monthlyLimit,
                            current: currentCount,
                            year,
                            month,
                        }),
                        {
                            status: 429,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }
            }
        }

        const model = resolveModel(selectedModel);

        // console.log("Chat action - model:", selectedModel, "mode:", mode, "tools:", selectedTools, "skills:", selectedSkills);

        // Discover skills at startup and inject catalog into the system prompt.
        // An empty selectedSkills array means "all skills available".
        const allowedPaths = selectedSkills.length > 0 ? selectedSkills : undefined;
        const skills = await discoverSkills(allowedPaths);
        const skillsCatalog = buildSkillsCatalog(skills);
        const { load_skill_manual } = createSkillTools(skills);

        // Determine optional tools: education/freestyle = all, select = user-picked
        const activeOptionalToolIds: OptionalToolId[] = mode === "select" ? selectedTools : ALL_OPTIONAL_TOOL_IDS;

        const optionalTools = Object.fromEntries(
            activeOptionalToolIds.filter((id) => TOOL_REGISTRY[id]).map((id) => [id, TOOL_REGISTRY[id]])
        );

        const mainAgent = new ToolLoopAgent({
            model,
            instructions: getSystemPrompt(mode, skillsCatalog, proofreadEnabled),
            tools: {
                load_skill_manual,
                ...optionalTools,
                read_editor_content,
                ...(proofreadEnabled ? { proofread_exercise } : {}),
                insert_editor_content,
                generate_passage,
                plan_dse_reading,
            },
            stopWhen: stepCountIs(15),
        });

        const result = await mainAgent.stream({
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error processing chat request:", error);
        return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
