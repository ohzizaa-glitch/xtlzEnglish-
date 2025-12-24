
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string | undefined => {
  // 1. Check standard process.env (Webpack, CRA, Node)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    }
  } catch (e) {}

  // 2. Check Vite's import.meta.env
  try {
    // @ts-ignore
    if (import.meta && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {}

  return undefined;
};

export const createAIClient = () => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key не найден. В Vercel переименуйте переменную в 'VITE_API_KEY' или 'NEXT_PUBLIC_API_KEY' и сделайте Redeploy.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const getFriendlyErrorMessage = (error: any): string => {
  const msg = error?.message || error?.toString() || '';
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
    return "⏳ Превышен лимит запросов к ИИ (429). Подождите 1-2 минуты и попробуйте снова.";
  }
  
  if (msg.includes('503') || msg.includes('overloaded')) {
    return "🤖 Сервер ИИ перегружен. Попробуйте через минуту.";
  }
  
  if (msg.includes('API Key') || msg.includes('403') || msg.includes('permission')) {
    return "🔑 Ошибка доступа. Проверьте API ключ.";
  }
  
  if (msg.includes('fetch') || msg.includes('network')) {
    return "🌐 Ошибка сети. Проверьте интернет-соединение.";
  }

  return "Произошла ошибка при генерации. Попробуйте еще раз.";
};
