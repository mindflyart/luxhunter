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
  type: "newsletter" | "verification" | "report";
  leadData?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, name, type, leadData }: WelcomeEmailRequest = await req.json();

    console.log("Received email request:", {
      email,
      name,
      type,
      leadData,
    });

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
    const appUrl = Deno.env.get("APP_URL") || "https://luxhunter.com";

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
      const displayName = name || 'Valued Client';

      const borrowingCapacity = leadData?.borrowingCapacity
        ? Number(leadData.borrowingCapacity).toLocaleString("en-AU", { style: "currency", currency: "AUD" })
        : 'N/A';
      const monthlyRepayment = leadData?.monthlyRepayment
        ? Number(leadData.monthlyRepayment).toLocaleString("en-AU", { style: "currency", currency: "AUD" })
        : 'N/A';
      const stampDuty = leadData?.stampDuty
        ? Number(leadData.stampDuty).toLocaleString("en-AU", { style: "currency", currency: "AUD" })
        : 'N/A';

      let htmlTemplate = await Deno.readTextFile("./welcome-email.html");

      htmlTemplate = htmlTemplate.replace(/{{name}}/g, displayName);
      htmlTemplate = htmlTemplate.replace(/{{borrowingCapacity}}/g, borrowingCapacity);
      htmlTemplate = htmlTemplate.replace(/{{monthlyRepayment}}/g, monthlyRepayment);
      htmlTemplate = htmlTemplate.replace(/{{stampDuty}}/g, stampDuty);
      htmlTemplate = htmlTemplate.replace(/{{verificationUrl}}/g, verificationUrl);

      emailSubject = "Verify Your Email - Unlock Your Property Report";
      emailHtml = htmlTemplate;
    } else if (type === "report") {
      const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
      const calendlyUrl = "https://calendly.com/luxhunter";

      const fullResults = leadData ? `
        <div style="background: #1e3a5f; padding: 24px; border-radius: 8px; margin: 24px 0; border: 2px solid #C9A84C;">
          <h3 style="color: #C9A84C; margin: 0 0 20px 0; font-size: 20px; text-align: center;">Complete Calculator Results</h3>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            ${leadData.annualIncome ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Annual Income</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.annualIncome).toLocaleString()}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.borrowingCapacity ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Borrowing Capacity</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.borrowingCapacity).toLocaleString()}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.monthlyRepayment ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Monthly Repayment</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.monthlyRepayment).toLocaleString()}/month</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.stampDuty ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Stamp Duty</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.stampDuty).toLocaleString()}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.propertyPrice ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Property Price</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.propertyPrice).toLocaleString()}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.deposit ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Deposit Amount</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">$${Number(leadData.deposit).toLocaleString()}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.loanTerm ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Loan Term</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">${leadData.loanTerm} years</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.postcode && leadData.state ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2);">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Location</p>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">${leadData.postcode}, ${leadData.state}</p>
                </td>
              </tr>
            ` : ''}
            ${leadData.locationClassification && leadData.locationClassification !== 'N/A' ? `
              <tr>
                <td style="padding: 12px;">
                  <p style="color: #C9A84C; margin: 0; font-size: 14px; font-weight: 600;">Location Classification</p>
                </td>
                <td style="padding: 12px; text-align: right;">
                  <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">${leadData.locationClassification}</p>
                </td>
              </tr>
            ` : ''}
          </table>
        </div>
      ` : '';

      const interestRatesSection = `
        <div style="background: rgba(201, 168, 76, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #C9A84C;">
          <h3 style="color: #C9A84C; margin: 0 0 16px 0; font-size: 18px;">Current Interest Rates</h3>
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <p style="color: #ccc; margin: 0; font-size: 14px;">Variable Rate (Owner Occupied)</p>
              </td>
              <td style="padding: 8px 0; text-align: right;">
                <p style="color: #fff; margin: 0; font-size: 16px; font-weight: bold;">6.09% p.a.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <p style="color: #ccc; margin: 0; font-size: 14px;">Fixed Rate (3 Years)</p>
              </td>
              <td style="padding: 8px 0; text-align: right;">
                <p style="color: #fff; margin: 0; font-size: 16px; font-weight: bold;">5.79% p.a.</p>
              </td>
            </tr>
          </table>
          <p style="color: #888; margin: 16px 0 0 0; font-size: 12px; font-style: italic;">*Rates are indicative and subject to change. Actual rates depend on individual circumstances.</p>
        </div>
      `;

      emailSubject = "Your Full LuxHunter Property Report";
      emailHtml = `
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
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
                  <tr>
                    <td style="padding: 48px 40px; text-align: center; background: #0a1628; border-bottom: 3px solid #C9A84C;">
                      <h1 style="color: #C9A84C; font-size: 36px; margin: 0; font-weight: bold; letter-spacing: 1px;">LuxHunter</h1>
                      <p style="color: #888; font-size: 14px; margin: 8px 0 0 0; letter-spacing: 2px; text-transform: uppercase;">Property & Mortgage Advisory</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; font-weight: 600; text-align: center;">Your Full Property Report</h2>
                      <p style="color: #ccc; line-height: 1.8; font-size: 16px; margin: 0 0 24px 0;">Dear ${name || "Valued Client"},</p>
                      <p style="color: #ccc; line-height: 1.8; font-size: 16px; margin: 0 0 24px 0;">Thank you for verifying your email! Here is your complete property analysis and calculator results.</p>
                      ${fullResults}
                      ${interestRatesSection}
                      <div style="background: rgba(201, 168, 76, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
                        <h3 style="color: #C9A84C; margin: 0 0 16px 0; font-size: 20px;">Ready to Take the Next Step?</h3>
                        <p style="color: #ccc; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Book a free consultation with our expert team to discuss your personalized property strategy and mortgage options.</p>
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 8px; background: linear-gradient(135deg, #C9A84C 0%, #d4b865 100%); box-shadow: 0 4px 16px rgba(201, 168, 76, 0.4);">
                              <a href="${calendlyUrl}" style="display: inline-block; padding: 18px 48px; color: #0A1628; text-decoration: none; font-weight: bold; font-size: 18px; letter-spacing: 0.5px;">
                                Book Free Consultation
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                        Questions? Reply to this email or call us at <strong style="color: #C9A84C;">1300 XXX XXX</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px; background: #0a1628; border-top: 1px solid #1e3a5f;">
                      <p style="color: #666; font-size: 12px; text-align: center; margin: 0 0 12px 0;">
                        <a href="${appUrl}/privacy-policy" style="color: #C9A84C; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
                        <a href="${appUrl}/terms-of-service" style="color: #C9A84C; text-decoration: none; margin: 0 8px;">Terms of Service</a> |
                        <a href="${unsubscribeUrl}" style="color: #C9A84C; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
                      </p>
                      <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        LuxHunter Property Services<br>
                        <a href="mailto:info@luxhunter.com.au" style="color: #C9A84C; text-decoration: none;">info@luxhunter.com.au</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else {
      const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
      const calendlyUrl = "https://calendly.com/luxhunter";

      emailSubject = "Welcome to LuxHunter Property Services";
      emailHtml = `
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
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
                  <tr>
                    <td style="padding: 48px 40px; text-align: center; background: #0a1628; border-bottom: 3px solid #C9A84C;">
                      <h1 style="color: #C9A84C; font-size: 36px; margin: 0; font-weight: bold; letter-spacing: 1px;">LuxHunter</h1>
                      <p style="color: #888; font-size: 14px; margin: 8px 0 0 0; letter-spacing: 2px; text-transform: uppercase;">Property & Mortgage Advisory</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; font-weight: 600;">Welcome, ${name || "Subscriber"}!</h2>
                      <p style="color: #ccc; line-height: 1.8; font-size: 16px; margin: 0 0 24px 0;">Thank you for subscribing to LuxHunter Property Services. We're excited to have you join our community of smart property investors and homebuyers.</p>
                      <div style="background: #1e3a5f; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #C9A84C;">
                        <h3 style="color: #C9A84C; margin: 0 0 16px 0; font-size: 20px;">What You'll Receive:</h3>
                        <ul style="color: #ccc; line-height: 2; font-size: 15px; margin: 0; padding-left: 20px;">
                          <li>Expert property market insights and analysis</li>
                          <li>Exclusive mortgage deals and rate updates</li>
                          <li>First home buyer tips and strategies</li>
                          <li>Latest Sydney property market trends</li>
                          <li>Investment property opportunities</li>
                        </ul>
                      </div>
                      <div style="background: rgba(201, 168, 76, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
                        <h3 style="color: #C9A84C; margin: 0 0 16px 0; font-size: 20px;">Ready to Start Your Property Journey?</h3>
                        <p style="color: #ccc; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Book a free consultation with our expert advisors to discuss your property goals and discover the best mortgage options for you.</p>
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 8px; background: linear-gradient(135deg, #C9A84C 0%, #d4b865 100%); box-shadow: 0 4px 16px rgba(201, 168, 76, 0.4);">
                              <a href="${calendlyUrl}" style="display: inline-block; padding: 18px 48px; color: #0A1628; text-decoration: none; font-weight: bold; font-size: 18px; letter-spacing: 0.5px;">
                                Book Free Consultation
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px; background: #0a1628; border-top: 1px solid #1e3a5f;">
                      <p style="color: #666; font-size: 12px; text-align: center; margin: 0 0 12px 0;">
                        <a href="${unsubscribeUrl}" style="color: #C9A84C; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
                      </p>
                      <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        Questions? Contact us at <a href="mailto:info@luxhunter.com.au" style="color: #C9A84C; text-decoration: none;">info@luxhunter.com.au</a><br>
                        LuxHunter Property Services
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LuxHunter <noreply@mail.luxhunter.com>",
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
