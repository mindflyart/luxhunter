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

    if (leadData.propertyPrice || leadData.deposit) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const appUrl = Deno.env.get("APP_URL") || "https://luxhunter.com.au";

      if (resendApiKey) {
        const calculatorResults = `
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0A1628; margin-top: 0;">Your Calculator Results</h3>
            ${leadData.propertyPrice ? `<p><strong>Property Price:</strong> $${Number(leadData.propertyPrice).toLocaleString()}</p>` : ''}
            ${leadData.deposit ? `<p><strong>Deposit:</strong> $${Number(leadData.deposit).toLocaleString()}</p>` : ''}
            ${leadData.loanAmount ? `<p><strong>Loan Amount:</strong> $${Number(leadData.loanAmount).toLocaleString()}</p>` : ''}
            ${leadData.state ? `<p><strong>State:</strong> ${leadData.state}</p>` : ''}
          </div>
        `;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #ffffff; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #C9A84C; font-size: 28px; margin: 0;">LuxHunter</h1>
              <p style="color: #888; font-size: 14px; margin-top: 8px;">Property & Mortgage Advisory</p>
            </div>
            <h2 style="color: #ffffff; font-size: 22px;">Thank you, ${leadData.name || "valued customer"}!</h2>
            <p style="color: #ccc; line-height: 1.6;">Your email has been verified successfully. Here are your property calculator results:</p>
            ${calculatorResults}
            <p style="color: #ccc; line-height: 1.6;">Our team will review your information and reach out to you shortly with personalized recommendations.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}/contact" style="background: #C9A84C; color: #0A1628; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Book a Consultation
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #1e3a5f; margin: 24px 0;">
            <p style="color: #888; font-size: 12px; text-align: center;">LuxHunter Property Services | info@luxhunter.com.au</p>
          </div>
        `;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "LuxHunter <noreply@luxhunter.com.au>",
              to: [tokenRecord.email],
              subject: "Your LuxHunter Property Report & Calculator Results",
              html: emailHtml,
            }),
          });
        } catch (error) {
          console.error("Error sending results email:", error);
        }
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
