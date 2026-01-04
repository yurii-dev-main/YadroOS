import { env } from '../config/env';

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'Ви — корпоративний AI-радник YadroOS. Надавайте короткі, структуровані відповіді українською мовою з конкретними діями.';

const buildMessages = (messages: AIChatMessage[]) => {
  const normalized = messages.filter((message) => message.content?.trim());
  return [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...normalized];
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

export const generateAIResponse = async (messages: AIChatMessage[]) => {
  const payload = await requestOpenAI<{
    choices?: Array<{ message?: { content?: string } }>;
  }>({
    model: DEFAULT_MODEL,
    messages: buildMessages(messages),
    temperature: 0.2
  });

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenAI response is empty');
  }

  return content;
};
