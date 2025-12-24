
import { GoogleGenAI } from "@google/genai";

// Helper to safely get env vars
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

// Configuration
const API_KEY = getEnv('VITE_API_KEY') || getEnv('NEXT_PUBLIC_API_KEY') || getEnv('REACT_APP_API_KEY');

// Default model for free tier (Fast and smart)
// You can use 'gemini-2.0-flash' or 'gemini-2.0-flash-exp' which are free in AI Studio
const DEFAULT_MODEL = 'gemini-2.0-flash'; 

/**
 * Generate text using Google Gemini
 */
export const generateText = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
  if (!API_KEY) {
    console.error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
    throw new Error("API Key is missing. Please set VITE_API_KEY.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Using the models.generateContent method as recommended
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: jsonMode ? "application/json" : "text/plain",
        // Temperature controls randomness: 0.7 is good for creative but structured tasks
        temperature: 0.7, 
      }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to make error messages understandable for the user
 */
export const getFriendlyErrorMessage = (error: any): string => {
  const msg = (error?.message || error?.toString() || '').toLowerCase();
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
    return "⏳ Превышен лимит бесплатной версии. Подождите минутку и попробуйте снова.";
  }
  
  if (msg.includes('key') || msg.includes('api_key') || msg.includes('403') || msg.includes('401')) {
    return "🔑 Ошибка ключа API. Проверьте VITE_API_KEY в настройках.";
  }

  if (msg.includes('location') || msg.includes('region')) {
    return "🌍 API недоступно в вашем регионе (попробуйте VPN).";
  }
  
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
    return "🌐 Ошибка сети. Проверьте подключение к интернету.";
  }

  if (msg.includes('candidate')) {
    return "🤖 ИИ не смог сгенерировать ответ. Попробуйте изменить запрос.";
  }

  return "Произошла ошибка при обращении к ИИ. Попробуйте позже.";
};
