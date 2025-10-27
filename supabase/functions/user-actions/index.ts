import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
const CLERK_API_URL = "https://api.clerk.com/v1";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (!userId || !action) {
      throw new Error("Missing required parameters: id and action");
    }

    let clerkResponse;

    switch (action) {
      case "lock":
        // Ban user in Clerk
        clerkResponse = await fetch(`${CLERK_API_URL}/users/${userId}/ban`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });
        break;

      case "unlock":
        // Unban user in Clerk
        clerkResponse = await fetch(`${CLERK_API_URL}/users/${userId}/unban`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });
        break;

      case "delete":
        // Delete user in Clerk
        clerkResponse = await fetch(`${CLERK_API_URL}/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.text();
      throw new Error(`Clerk API error: ${clerkResponse.status} - ${errorData}`);
    }

    const result = clerkResponse.status === 204 ? { success: true } : await clerkResponse.json();

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error performing user action:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to perform action" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
