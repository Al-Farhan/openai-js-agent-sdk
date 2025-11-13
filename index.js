import "dotenv/config";
import { Agent, run } from "@openai/agents";

const helloWorldAgent = new Agent({
  name: "hello world",
  instructions:
    "Your are an Agent that always says Hello World! with user name.",
});

const historyFunFact = new Agent({
  name: "History Tutor",
  instructions:
    "You provide assistance with historical queries. Explain important events and context clearly.",
});

const result = await run(historyFunFact, "When did sharks first appear?");

console.log(result.finalOutput);
