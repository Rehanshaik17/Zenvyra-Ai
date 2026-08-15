import { AgentService } from './backend/src/agent/AgentService';

import * as dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not found in backend/.env');
  process.exit(1);
}
const agent = new AgentService(apiKey);

async function test() {
  try {
    const res = await agent.processMessage([], "Hello");
    console.log(res);
  } catch (e) {
    console.error("Test failed", e);
  }
}

test();
