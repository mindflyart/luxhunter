import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  type: "newsletter" | "verification";
  leadData?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, name, type, leadData }: WelcomeEmailRequest = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = Deno.env.get("APP_URL") || "https://luxhunter.com.au";

    let emailSubject = "";
    let emailHtml = "";

    if (type === "verification") {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const token = crypto.randomUUID();

      const { error: tokenError } = await supabase
        .from("email_verification_tokens")
        .insert({
          email,
          token,
          lead_data: leadData || {},
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (tokenError) {
        console.error("Error storing verification token:", tokenError);
        return new Response(JSON.stringify({ error: "Failed to create verification token" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const verificationUrl = `${appUrl}/verify-email?token=${token}`;

      emailSubject = "Verify your email - LuxHunter Property Services";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #ffffff; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #C9A84C; font-size: 28px; margin: 0;">LuxHunter</h1>
            <p style="color: #888; font-size: 14px; margin-top: 8px;">Property & Mortgage Advisory</p>
          </div>
          <h2 style="color: #ffffff; font-size: 22px;">Hi ${name || "there"},</h2>
          <p style="color: #ccc; line-height: 1.6;">Thank you for your interest in LuxHunter Property Services! Please verify your email address to receive your free property report and calculator results.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background: #C9A84C; color: #0A1628; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              ✓ Verify My Email
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #1e3a5f; margin: 24px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">LuxHunter Property Services | info@luxhunter.com.au</p>
        </div>
      `;
    } else {
      const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

      emailSubject = "Welcome to LuxHunter Property Services!";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #ffffff; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #C9A84C; font-size: 28px; margin: 0;">LuxHunter</h1>
            <p style="color: #888; font-size: 14px; margin-top: 8px;">Property & Mortgage Advisory</p>
          </div>
          <h2 style="color: #ffffff; font-size: 22px;">Welcome, ${name || "Subscriber"}!</h2>
          <p style="color: #ccc; line-height: 1.6;">Thank you for subscribing to LuxHunter Property Services newsletter!</p>
          <p style="color: #ccc; line-height: 1.6;">You will now receive:</p>
          <ul style="color: #ccc; line-height: 2;">
            <li>Expert property market insights</li>
            <li>Exclusive mortgage deals and updates</li>
            <li>Tips for first-time home buyers</li>
            <li>Latest Sydney property trends</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #1e3a5f; margin: 24px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            <a href="${unsubscribeUrl}" style="color: #C9A84C; text-decoration: none;">Unsubscribe</a> |
            Questions? Contact us at <a href="mailto:info@luxhunter.com.au" style="color: #C9A84C; text-decoration: none;">info@luxhunter.com.au</a>
          </p>
        </div>
      `;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LuxHunter <noreply@luxhunter.com.au>",
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: type === "verification" ? "Verification email sent" : "Welcome email sent", id: resendData.id }),
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
