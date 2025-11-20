import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

let sharedHistory = [];

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
  // Store the message in DB (history)
  sharedHistory.push({ role: "user", content: q });
  const result = await run(sqlAgent, sharedHistory);
  sharedHistory = result.history;
  console.log("Result:", result.finalOutput);
}

main("Hey my name is Farhan").then(() => {
  main("Get me all the users with my name.");
});
