import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const GetWeatherResultSchema = z.object({
  city: z.string().describe("name of the city"),
  degree_c: z.string().describe("the degree celcius of the temperature"),
  condition: z.string().optional().describe("condition of the weather"),
});

const getWeatherTool = tool({
  name: "get_weather",
  description: "Return the weather for a give city.",
  parameters: z.object({ city: z.string().describe("Name of the city") }),
  async execute({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather in ${city} is ${response.data}.`;
  },
});

const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
        You are an expert weather agent that helps user to tell weather report
    `,
  tools: [getWeatherTool],
  outputType: GetWeatherResultSchema,
});

async function main(query = "") {
  const result = await run(weatherAgent, query);
  console.log(`Result:`, result.finalOutput);
}

main(`What is the weather of Azamgarh?`);
