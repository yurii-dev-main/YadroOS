import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

const SYSTEM_PROMPT =
  'You are the YadroOS corporate AI advisor. Provide concise, structured responses in English with concrete actions. You have access to tools to interact with the system. Always use them if the user asks you to perform an action.';

// Mock function executors for now
const executeFunction = async (name: string, args: any) => {
  console.log(`Executing AI Tool: ${name}`, args);
  if (name === 'create_crm_deal') {
    return {
      success: true,
      message: `Deal ${args.name} for $${args.amount} with ${args.clientName} created successfully.`,
      dealId: 'deal-' + Date.now()
    };
  }
  if (name === 'send_message') {
    return { success: true, message: `Message sent to ${args.threadId}.` };
  }
  return { success: false, error: 'Function not found' };
};

export const generateAIResponse = async (
  messages: AIChatMessage[],
  organizationId: string
): Promise<{ content: string; actions?: any[] }> => {
  const geminiIntegration = await prisma.integrationConnection.findFirst({
    where: { provider: 'gemini', status: 'connected', organizationId }
  });

  if (!geminiIntegration || !geminiIntegration.credentials) {
    throw new Error('Gemini API is not connected or API key is missing');
  }

  const creds = geminiIntegration.credentials as { apiKey?: string };
  const apiKey = creds.apiKey;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured in integrations');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Define tools in Gemini format
  const tools = [
    {
      functionDeclarations: [
        {
          name: 'create_crm_deal',
          description: 'Creates a new deal in the CRM system',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              name: { type: 'STRING' as any, description: 'Name of the deal' },
              amount: { type: 'NUMBER' as any, description: 'Estimated value in USD' },
              clientName: { type: 'STRING' as any, description: 'Name of the client' }
            },
            required: ['name', 'amount', 'clientName']
          }
        },
        {
          name: 'send_message',
          description: 'Sends a message to a client or team member',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              threadId: { type: 'STRING' as any, description: 'The chat/thread ID to send to' },
              text: { type: 'STRING' as any, description: 'The message content' }
            },
            required: ['threadId', 'text']
          }
        }
      ]
    }
  ];

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    tools: tools,
    systemInstruction: SYSTEM_PROMPT
  });

  // Convert messages to Gemini format
  const history = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }));

  // Pop the last user message to send it
  const lastMsg = history.length > 0 ? history.pop() : null;
  const prompt = lastMsg ? lastMsg.parts[0].text : 'Hello';

  const chat = model.startChat({ history });

  const result = await chat.sendMessage(prompt);
  const response = result.response;

  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    const actionsTaken = [];
    const functionResponses = [];

    for (const call of functionCalls) {
      const functionName = call.name;
      const functionArgs = call.args;

      const functionResult = await executeFunction(functionName, functionArgs);

      actionsTaken.push({
        type: functionName,
        params: functionArgs,
        result: functionResult
      });

      functionResponses.push({
        functionResponse: {
          name: functionName,
          response: functionResult
        }
      });
    }

    // Send function responses back to the model
    const followupResult = await chat.sendMessage(functionResponses as any);

    return {
      content: followupResult.response.text(),
      actions: actionsTaken
    };
  }

  return { content: response.text(), actions: [] };
};
