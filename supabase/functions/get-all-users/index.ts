import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
const CLERK_API_URL = "https://api.clerk.com/v1";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") || "10";
    const offset = url.searchParams.get("offset") || "0";
    const orderBy = url.searchParams.get("order_by") || "-created_at";

    // Fetch users from Clerk API
    const clerkResponse = await fetch(
      `${CLERK_API_URL}/users?limit=${limit}&offset=${offset}&order_by=${orderBy}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!clerkResponse.ok) {
      throw new Error(`Clerk API error: ${clerkResponse.status}`);
    }

    const clerkData = await clerkResponse.json();

    // Return the data
    return new Response(JSON.stringify(clerkData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch users" }),
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
