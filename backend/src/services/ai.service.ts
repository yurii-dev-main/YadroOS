import { env } from '../config/env';

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'You are the YadroOS corporate AI advisor. Provide concise, structured responses in English with concrete actions. You have access to tools to interact with the system. Always use them if the user asks you to perform an action.';

// Define our tools
const aiTools = [
  {
    type: 'function',
    function: {
      name: 'create_crm_deal',
      description: 'Creates a new deal in the CRM system',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the deal' },
          amount: { type: 'number', description: 'Estimated value in USD' },
          clientName: { type: 'string', description: 'Name of the client' }
        },
        required: ['name', 'amount', 'clientName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'send_message',
      description: 'Sends a message to a client or team member',
      parameters: {
        type: 'object',
        properties: {
          threadId: { type: 'string', description: 'The chat/thread ID to send to' },
          text: { type: 'string', description: 'The message content' }
        },
        required: ['threadId', 'text']
      }
    }
  }
];

const buildMessages = (messages: AIChatMessage[]) => {
  return [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages];
};

const requestOpenAI = async <TResponse>(body: Record<string, unknown>): Promise<TResponse> => {
  if (!env.openAiApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as TResponse;
};

// Mock function executors for now
const executeFunction = async (name: string, args: any) => {
  console.log(`Executing AI Tool: ${name}`, args);
  if (name === 'create_crm_deal') {
    // Here we would call prisma.deal.create(...)
    return { success: true, message: `Deal ${args.name} for $${args.amount} with ${args.clientName} created successfully.`, dealId: 'deal-' + Date.now() };
  }
  if (name === 'send_message') {
    // Here we would call communications controller
    return { success: true, message: `Message sent to ${args.threadId}.` };
  }
  return { success: false, error: 'Function not found' };
};

export const generateAIResponse = async (messages: AIChatMessage[]): Promise<{ content: string; actions?: any[] }> => {
  const payload = await requestOpenAI<{
    choices?: Array<{ message?: { role: string; content?: string | null; tool_calls?: any[] } }>;
  }>({
    model: DEFAULT_MODEL,
    messages: buildMessages(messages),
    temperature: 0.2,
    tools: aiTools,
    tool_choice: 'auto'
  });

  const responseMessage = payload.choices?.[0]?.message;
  
  if (!responseMessage) {
    throw new Error('OpenAI response is empty');
  }

  // Check if AI wanted to call a function
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const actionsTaken = [];
    
    // Create a new messages array including the assistant's tool calls
    const nextMessages = [...messages, { 
      role: 'assistant' as const, 
      content: responseMessage.content,
      tool_calls: responseMessage.tool_calls 
    }];

    for (const toolCall of responseMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      // Execute the actual code
      const functionResponse = await executeFunction(functionName, functionArgs);
      
      actionsTaken.push({
        type: functionName,
        params: functionArgs,
        result: functionResponse
      });

      // Append the tool result to the conversation
      nextMessages.push({
        tool_call_id: toolCall.id,
        role: 'tool' as const,
        name: functionName,
        content: JSON.stringify(functionResponse),
      });
    }

    // Call OpenAI again so it can summarize the result
    const finalPayload = await requestOpenAI<{
      choices?: Array<{ message?: { content?: string } }>;
    }>({
      model: DEFAULT_MODEL,
      messages: buildMessages(nextMessages),
      temperature: 0.2,
      tools: aiTools
    });

    return {
      content: finalPayload.choices?.[0]?.message?.content || 'Action completed.',
      actions: actionsTaken
    };
  }

  return { content: responseMessage.content || '', actions: [] };
};
