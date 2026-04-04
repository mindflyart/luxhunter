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
    const body = await req.json();
    const { token, ...directData } = body;

    console.log("Received Airtable save request:", {
      token,
      directData,
    });

    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");
    const airtableTableName = Deno.env.get("AIRTABLE_TABLE_NAME") || "Leads";

    if (!airtableApiKey || !airtableBaseId) {
      return new Response(JSON.stringify({ error: "Airtable not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let leadData = directData;

    if (token) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: tokenRecord, error: tokenError } = await supabase
        .from("email_verification_tokens")
        .select("*")
        .eq("token", token)
        .eq("verified", true)
        .single();

      if (tokenError || !tokenRecord) {
        return new Response(JSON.stringify({ error: "Invalid or unverified token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      leadData = { ...tokenRecord.lead_data };
    }

    const airtableFields: Record<string, unknown> = {
      "Name": leadData.name || "",
      "Email": leadData.email || "",
      "Phone": leadData.phone || "",
      "State": leadData.state || "",
      "Postcode": leadData.postcode || "",
      "Interest Type": leadData.interest || leadData.interest_type || "",
      "Source": leadData.source || "Website",
      "Preferred Contact": leadData.preferredContact || "",
      "Annual Income": leadData.annualIncome ? Number(leadData.annualIncome) : undefined,
      "Borrowing Capacity": leadData.borrowingCapacity ? Number(leadData.borrowingCapacity) : undefined,
      "Monthly Repayment": leadData.monthlyRepayment ? Number(leadData.monthlyRepayment) : undefined,
      "Stamp Duty": leadData.stampDuty ? Number(leadData.stampDuty) : undefined,
      "Property Price": leadData.propertyPrice ? Number(leadData.propertyPrice) : undefined,
      "Deposit": leadData.deposit ? Number(leadData.deposit) : undefined,
      "Loan Term": leadData.loanTerm ? Number(leadData.loanTerm) : undefined,
      "Location Classification": leadData.locationClassification || "",
      "Notes": leadData.notes || "",
      "Date Submitted": new Date().toISOString(),
    };

    Object.keys(airtableFields).forEach(key => {
      if (airtableFields[key] === undefined) delete airtableFields[key];
    });

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: airtableFields }),
      }
    );

    const airtableData = await airtableResponse.json();

    if (!airtableResponse.ok) {
      console.error("Airtable error:", airtableData);
      return new Response(JSON.stringify({ error: "Failed to save to Airtable", details: airtableData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, id: airtableData.id }),
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
