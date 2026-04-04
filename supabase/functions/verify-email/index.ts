import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokenRecord, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenRecord) {
      return new Response(JSON.stringify({ error: "Invalid verification token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tokenRecord.verified) {
      return new Response(JSON.stringify({ error: "Email already verified" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Verification token has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("email_verification_tokens")
      .update({ verified: true })
      .eq("token", token);

    if (updateError) {
      console.error("Error updating token:", updateError);
      return new Response(JSON.stringify({ error: "Failed to verify email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadData = tokenRecord.lead_data as Record<string, unknown>;

    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");

    if (airtableApiKey && airtableBaseId) {
      try {
        const saveResponse = await fetch(
          `${supabaseUrl}/functions/v1/save-to-airtable`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!saveResponse.ok) {
          console.error("Failed to save to Airtable:", await saveResponse.text());
        }
      } catch (error) {
        console.error("Error calling save-to-airtable:", error);
      }
    }

    if (leadData.propertyPrice || leadData.deposit || leadData.borrowingCapacity) {
      try {
        await fetch(
          `${supabaseUrl}/functions/v1/send-welcome-email`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: tokenRecord.email,
              name: leadData.name,
              type: "report",
              leadData,
            }),
          }
        );
      } catch (error) {
        console.error("Error sending report email:", error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
