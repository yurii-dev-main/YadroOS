import type { ChatMessage } from '../types/ai.types';

const SYSTEM_PROMPT = `Ви — корпоративний AI-радник YadroOS. Надавайте короткі, структуровані відповіді українською мовою з конкретними діями.`;

export interface GenerateResponseParams {
  messages: ChatMessage[];
}

export const generateAIResponse = async ({ messages }: GenerateResponseParams): Promise<string> => {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');

  if (!lastUserMessage) {
    return 'Чим можу допомогти сьогодні?';
  }

  const prompt = `${SYSTEM_PROMPT}\nКористувач: ${lastUserMessage.content}`;

  // У реальній системі тут буде виклик OpenAI/Claude API.
  // Для демо повертаємо евристичну відповідь.
  if (prompt.includes('касовий потік') || prompt.includes('cash flow')) {
    return 'Прогноз грошового потоку на наступний квартал: +$420K (базовий сценарій). Рекомендую оптимізувати витрати на маркетинг на 8% для розширення runway до 10 місяців.';
  }

  if (prompt.includes('клієнт') || prompt.includes('client')) {
    return 'Топ-5 клієнтів за доходом: NovaCom, Delta Group, Innotech, AgroLine, FinCore. Зверніть увагу на upsell для Delta Group (потенціал +$60K).';
  }

  if (prompt.includes('співробітник') || prompt.includes('employees')) {
    return 'Співробітники з ризиком падіння продуктивності: Іван Петренко (-12% за місяць), Олена Коваленко (-9%). Рекомендовано запланувати 1-на-1 та переглянути навчальні плани.';
  }

  return 'Я проаналізував дані. Основні пріоритети: завершити 3 ключові угоди на стадії Negotiation, запустити програму утримання для команди Support та переглянути бюджет R&D (+12% від плану).';
};
