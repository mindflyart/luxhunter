import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminPassword = Deno.env.get("VITE_ADMIN_PASSWORD") || "(not set)";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a1628;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a1628;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse; background: #1e3a5f; border-radius: 12px; overflow: hidden; border: 1px solid rgba(201,168,76,0.3);">
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: #0a1628; border-bottom: 3px solid #c9a84c;">
              <span style="font-size: 28px; font-weight: 700; color: #c9a84c; letter-spacing: 2px;">LUXHUNTER</span>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">Admin Password Reminder</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Your admin panel password is:</p>
              <div style="background: #0a1628; border: 2px solid #c9a84c; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-size: 22px; font-weight: 700; color: #c9a84c; letter-spacing: 2px; font-family: monospace;">${adminPassword}</span>
              </div>
              <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0;">If you did not request this reminder, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: #0a1628; border-top: 1px solid #1e3a5f; text-align: center;">
              <p style="color: #666; font-size: 11px; margin: 0;">© 2026 LuxHunter. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LuxHunter <noreply@mail.luxhunter.com>",
        to: ["info@luxhunter.com"],
        subject: "Admin Password Reminder",
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
      JSON.stringify({ success: true }),
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
