import { AgentService } from './backend/src/agent/AgentService';

const apiKey = "AIzaSyCb7pm-H1At7GWtn3hK0TwSDsRgt058dFA"; // the mock one
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
