import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
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
      `Refund for Customer having id ${customerId} for ${reason}.\n`,
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

const receptionAgent = Agent.create({
  name: "Reception Agent",
  instructions: `
        ${RECOMMENDED_PROMPT_PREFIX}
        You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent.
    `,
  handoffDescription: `
        - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers.
        - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them.
    `.trimStart(),
  handoffs: [salesAgent, refundAgent],
});

async function runAgent(query = "") {
  const result = await run(receptionAgent, query);
  console.log("Result:", result.finalOutput);
  console.log("History:", result.history);
}

runAgent(
  "I want refund, your internet speed is too slow. My customer id is cust_998"
);
