import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse/sync";

const csvFilePath = "./usage_events.csv";
const ORB_API_KEY = process.env.ORB_API_KEY;

// Helper: clean numbers like "1,290" → 1290
// Returns null if the value is empty or undefined
function parseNumber(value) {
  if (!value) return null;
  return Number(value.toString().replace(/,/g, ""));
}

async function sendEvents() {
  try {
    // Read the CSV file synchronously
    const fileContent = fs.readFileSync(csvFilePath, "utf-8");

    // Parse CSV into an array of objects
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Found ${records.length} records in CSV`);

    // Transform CSV records into Orb events
    const events = records.map((record) => ({
      idempotency_key: String(record.transaction_id), // unique key to avoid duplicates
      external_customer_id: record.account_id, // customer identifier
      event_name: "transaction",
      properties: {
        account_type: record.account_type || "", // fallback to empty string if missing
        bank_id: record.bank_id || "",
        // Default to 0 if missing so Orb API doesn't reject null/undefined
        standard: parseNumber(record.standard) ?? 0,
        sameday: parseNumber(record.sameday) ?? 0,
      },
      // Use today's timestamp so no backfill is needed
      timestamp: new Date().toISOString(),
    }));

    // Send all events in one POST request
    const response = await fetch("https://api.withorb.com/v1/ingest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ORB_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events }),
    });
    // Log the full response from Orb for debugging
    const data = await response.json();
    console.log("Response from Orb:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error sending events:", err);
  }
}

sendEvents();
