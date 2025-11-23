import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const executeSQL = tool({
  name: "execute_sql",
  description: "This executes the SQL query.",
  parameters: z.object({
    sql: z.string().describe("the sql query"),
  }),
  execute: async function ({ sql }) {
    console.log(`[SQL]: Execute ${sql}`);
    return "done";
  },
});

const sqlAgent = new Agent({
  name: "SQL Expert Agent",
  tools: [executeSQL],
  instructions: `
          You are an expert SQL Agent that is specialized in generating SQL queries as per user request.
  
          Postgres Schema:
      -- users table
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
  
      -- comments table
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `,
});

async function main(q = "") {
  const result = await run(sqlAgent, q, {
    conversationId: "conv_692189fb8e4881968555887d930f81200bdb2282570075cd",
  });
  console.log("Result:", result.finalOutput);
}

main("Write a query to get users having my name?");
