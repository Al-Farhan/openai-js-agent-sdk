import "dotenv/config";
import { Agent, run, InputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

const mathInputAgent = new Agent({
  name: "Math Query Checker",
  instructions: `
        You are an input guardrail agent that checks, input is maths question or not.
        Rules:
        - Strictly maths question.
    `,
  outputType: z.object({
    isValidMathsQuestion: z
      .boolean()
      .describe("if the question is maths question"),
    reasoning: z.string().optional().describe("explain type of question"),
  }),
});

const mathInputGuardrail = {
  name: "Math Homework Guardrail",
  execute: async ({ input }) => {
    const result = await run(mathInputAgent, input);
    return {
      outputInfo: result.finalOutput.outputInfo,
      tripwireTriggered: !result.finalOutput.isValidMathsQuestion,
    };
  },
};

const mathsAgent = new Agent({
  name: "Maths Agent",
  instructions: `
        You are an expert maths ai agent.
    `,
  inputGuardrails: [mathInputGuardrail],
});

async function main(q = "") {
  try {
    const result = await run(mathsAgent, q);
    console.log("Result:", result.finalOutput);
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.log(`Query rejected because ${error.message}`);
    }
  }
}

// main("What is 2 + 30 * 4");
main("Write a javascript code to add two numbers");
