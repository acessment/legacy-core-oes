/**
 * Handle .well-known requests (e.g., Chrome DevTools, Apple App Site Association, etc.)
 * Returns 404 for all well-known paths that aren't explicitly configured
 */
export async function loader() {
    return new Response(null, { status: 404 });
}

export default function WellKnown() {
    return null;
}
