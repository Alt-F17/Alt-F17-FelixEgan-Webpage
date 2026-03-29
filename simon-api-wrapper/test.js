import dotenv from 'dotenv';
import { SimonAPI } from './simonClient.js';

// Load environment variables from .env
dotenv.config();

const client = new SimonAPI({
  token: process.env.SIMON_BEARER_TOKEN,
  cookie: process.env.SIMON_COOKIE
});

async function runTests() {
  console.log("=== Simon API Test Environment ===\n");

  // 1. Fetch leads
  const leads = await client.getLeads();
  console.log('GET Result:', leads);

  // 2. Create lead
  const newLead = await client.createLead({
      firstName: "Test",
      lastName: "Client",
      phone: "514-555-5555"
  });
  console.log('CREATE Result:', newLead);

  // 3. Update lead
  const updated = await client.updateLead(12345, { address: "123 New St" });
  console.log('UPDATE Result:', updated);

  // 4. Delete lead
  const deleted = await client.deleteLead(12345);
  console.log('DELETE Result:', deleted);

  console.log("\n==================================");
}

runTests();
