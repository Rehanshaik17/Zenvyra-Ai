/**
 * Zenyvra AI Agent — AgentService
 *
 * Core service that wraps the Gemini API with function-calling support.
 * Handles the full agentic loop:
 *   1. Send user message + history to Gemini (with tools)
 *   2. If Gemini requests a function call → execute it → feed result back
 *   3. Repeat until Gemini returns a text response
 *   4. Return the final text to the caller
 */

import { GoogleGenAI } from '@google/genai';
import { AGENT_SYSTEM_PROMPT } from './systemPrompt';
import { agentToolDeclarations, executeAgentTool } from './agentTools';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AgentService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Process a user message through the agent.
   * Maintains the agentic function-calling loop.
   */
  async processMessage(
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    // Build conversation contents in Gemini format
    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Inject current date/time so the agent can resolve "tomorrow", "next Monday", etc.
    const now = new Date().toISOString();
    const augmentedMessage = `[Current date/time: ${now}]\n\n${userMessage}`;
    contents.push({ role: 'user', parts: [{ text: augmentedMessage }] });

    // Agentic loop — keeps running until Gemini returns text (not a function call)
    const MAX_TOOL_ROUNDS = 5;
    let currentContents = contents;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: currentContents,
        config: {
          systemInstruction: AGENT_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: agentToolDeclarations as any }],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        return 'Sorry, I couldn\'t process that. Please try again.';
      }

      const parts = candidate.content.parts;

      // Check if any part is a function call
      const functionCallPart = parts.find((p: any) => p.functionCall);

      if (functionCallPart && (functionCallPart as any).functionCall) {
        const fc = (functionCallPart as any).functionCall;
        const toolName: string = fc.name;
        const toolArgs: Record<string, string> = fc.args || {};

        console.log(`[Agent] Tool call requested: ${toolName}`, toolArgs);

        // Execute the tool
        const toolResult = executeAgentTool(toolName, toolArgs);

        console.log(`[Agent] Tool result:`, toolResult);

        // Append model's function call + our function response to the conversation
        currentContents = [
          ...currentContents,
          {
            role: 'model',
            parts: [{ functionCall: { name: toolName, args: toolArgs } } as any],
          },
          {
            role: 'user',  // function responses go as "user" role per Gemini spec
            parts: [
              {
                functionResponse: {
                  name: toolName,
                  response: toolResult,
                },
              } as any,
            ],
          },
        ];

        // Continue the loop — Gemini will process the tool result and respond
        continue;
      }

      // No function call — extract text response
      const textPart = parts.find((p: any) => p.text);
      if (textPart && (textPart as any).text) {
        return (textPart as any).text;
      }

      return 'I processed your request but have nothing to say. Let me know if you need anything else.';
    }

    return 'I ran into a complex situation and need your help to simplify. Could you rephrase?';
  }
}
