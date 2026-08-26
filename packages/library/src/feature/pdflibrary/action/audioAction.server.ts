import type { ActionFunctionArgs } from "react-router";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function audioAction({ params }: ActionFunctionArgs): Promise<Response> {
    try {
        const { exercise_id } = params;

        console.log("audioAction called with exercise_id:", exercise_id);

        if (!exercise_id) {
            return new Response(JSON.stringify({ error: "Exercise ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            },
        });

        const bucketName = process.env.AWS_PRIVATE_BUCKET_NAME || "app-acessment-private";
        const audioKey = `exercises/audio/${exercise_id}.mp3`;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: audioKey,
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
            return new Response(JSON.stringify({ error: "Audio file not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const bytes = await response.Body.transformToByteArray();

        console.log("Fetched audio bytes:", bytes.length);

        // Convert bytes to base64 string
        const base64Audio = Buffer.from(bytes).toString('base64');

        return new Response(JSON.stringify({ audio: base64Audio }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error fetching audio:", error);
        return new Response(JSON.stringify({ error: "Failed to load audio" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
