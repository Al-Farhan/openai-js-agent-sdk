import "dotenv/config";
import { Agent, run, OutputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

const mathOutputAgent = new Agent({
  name: "Math output checker",
  instructions: `
        Check if the output includes any math output only.
        Rules:
        - The output has to be strictly a maths equation.
        - Reject any other kind of output even if reltated to maths.
    `,
  outputType: z.object({
    reasoning: z.string(),
    isMath: z.boolean(),
  }),
});

const mathOutputGuardrail = {
  name: "Math output guardrail",
  execute: async function ({ agentOutput }) {
    const result = await run(mathOutputAgent, agentOutput);
    console.log("Maths output:", result.finalOutput);
    return {
      outputInfo: result.finalOutput?.reasoning,
      tripwireTriggered: !result.finalOutput?.isMath,
    };
  },
};

const mathsAgent = new Agent({
  name: "Maths Expert Agent",
  instructions: `
    You are an expert maths ai agent.
  `,
  outputGuardrails: [mathOutputGuardrail],
});

async function main(q = "") {
  try {
    const result = await run(mathsAgent, q, { stream: true });
    // console.log("Result:", result.finalOutput);
    result
      .toTextStream({
        compatibleWithNodeStreams: true,
      })
      .pipe(process.stdout);
  } catch (error) {
    if (error instanceof OutputGuardrailTripwireTriggered) {
      console.log(`Query rejected because ${error.message}`);
    }
  }
}

// main("What is 2+2=");
main(
  "Write code in js to add, subtract, multiply and divide two number or more"
);
