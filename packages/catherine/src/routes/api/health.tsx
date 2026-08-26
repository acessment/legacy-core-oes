import { LoaderFunctionArgs } from "react-router";

/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 OK with basic app status
 */
export async function loader({ request }: LoaderFunctionArgs) {
    return new Response(
        JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "catherine",
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        }
    );
}
