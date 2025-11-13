import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import fs from "node:fs/promises";

const fetchAvailablePlans = tool({
  name: "fetch_available_plans",
  description: "Fetches the available plans for internet.",
  parameters: z.object({}),
  execute: async function () {
    return [
      { plan_id: "1", price_inr: 399, speed: "30MB/s" },
      { plan_id: "2", price_inr: 999, speed: "100MB/s" },
      { plan_id: "3", price_inr: 1499, speed: "2000MB/s" },
    ];
  },
});

const processRefund = tool({
  name: "process_refund",
  description: "This tool procces the refunds for a customer",
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  execute: async function ({ customerId, reason }) {
    fs.appendFile(
      "./refunds.txt",
      `Refund for Customer having id ${customerId} for ${reason}`,
      "utf-8"
    );
    return { refundIssued: true };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions: `
        Help customers process refunds and credits.
    `,
  tools: [processRefund],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: `
        You are an expert sales agent for an internet broadband company.
        Talk to the user and help them with what they need.
    `,
  tools: [
    fetchAvailablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});

async function runAgent(query = "") {
  const result = await run(salesAgent, query);
  console.log(result.finalOutput);
}

runAgent(
  "Hey, I want refund having customer id 123 and my plan is 399, your plan is very bad."
);
