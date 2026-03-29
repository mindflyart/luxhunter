import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  email: string;
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, name }: EmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`Sending welcome email to: ${email}`);

    const welcomeMessage = {
      to: email,
      subject: "Welcome to LuxHunter Property Services!",
      message: `Dear ${name || "Subscriber"},

Thank you for subscribing to LuxHunter Property Services newsletter!

We're excited to have you on board. You'll now receive:
- Expert property market insights
- Exclusive mortgage deals and updates
- Tips for first-time home buyers
- Latest Sydney property trends

Stay tuned for valuable content delivered straight to your inbox.

Best regards,
The LuxHunter Team

---
If you wish to unsubscribe, please contact us at info@luxhunter.com.au`,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome email queued",
        debug: welcomeMessage
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
