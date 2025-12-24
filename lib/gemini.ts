
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

// Smart Configuration Loading
const loadConfig = () => {
  let rawProvider = getEnv('VITE_AI_PROVIDER') || '';
  let openaiKey = getEnv('VITE_OPENAI_API_KEY');
  let apiKey = getEnv('VITE_API_KEY') || getEnv('NEXT_PUBLIC_API_KEY') || getEnv('REACT_APP_API_KEY');
  let baseUrl = getEnv('VITE_AI_BASE_URL');
  let model = getEnv('VITE_AI_MODEL');
  let provider = 'gemini';

  // 1. AUTO-FIX: Detect if user accidentally put the API Key in the PROVIDER field
  // Keys usually start with 'sk-' or are long strings (> 20 chars) without spaces
  if (rawProvider.startsWith('sk-') || rawProvider.startsWith('sk_') || (rawProvider.length > 20 && !rawProvider.includes(' '))) {
     console.warn("⚠️ Detected API Key in VITE_AI_PROVIDER. Switching to OpenAI/OpenRouter mode automatically.");
     openaiKey = rawProvider; // Use the value from provider as the key
     provider = 'openai';
  } else if (rawProvider === 'openai' || rawProvider === 'openrouter') {
     provider = 'openai';
  }

  // 2. AUTO-DETECT: If no Base URL is set, try to guess OpenRouter
  if (!baseUrl && provider === 'openai') {
      // If the key looks like an OpenRouter key (sk-or-...) OR if no URL was provided at all, 
      // we default to OpenRouter as it's the most common alternative wrapper.
      // Standard OpenAI keys usually start with 'sk-proj' now.
      if (openaiKey?.startsWith('sk-or-') || !openaiKey?.startsWith('sk-proj')) {
          baseUrl = 'https://openrouter.ai/api/v1';
          console.log("ℹ️ Defaulting to OpenRouter API URL");
      } else {
          baseUrl = 'https://api.openai.com/v1';
      }
  }

  // 3. AUTO-DETECT: Default Model
  if (!model) {
      if (provider === 'openai') {
          // If using OpenRouter, use free Gemini or low-cost model
          if (baseUrl?.includes('openrouter')) {
              model = 'google/gemini-2.0-flash-exp:free';
          } else {
              model = 'gpt-4o-mini';
          }
      } else {
          model = 'gemini-2.0-flash-exp';
      }
  }

  return { apiKey, provider, openaiKey, openaiBaseUrl: baseUrl, model };
};

const CONFIG = loadConfig();

/**
 * Universal AI Generation Function
 * Supports both Google SDK and OpenAI-compatible REST APIs (OpenAI, OpenRouter, DeepSeek, etc.)
 */
export const generateText = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
  
  // --- STRATEGY 1: OPENAI COMPATIBLE (OpenRouter, OpenAI, DeepSeek) ---
  if (CONFIG.provider === 'openai' && CONFIG.openaiKey) {
    try {
      console.log(`🚀 Sending request to ${CONFIG.openaiBaseUrl} using model ${CONFIG.model}`);
      
      const response = await fetch(`${CONFIG.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.openaiKey}`,
          // Headers specifically for OpenRouter
          'HTTP-Referer': 'https://xtlz-english.vercel.app', 
          'X-Title': 'Xtlz English App',
        },
        body: JSON.stringify({
          model: CONFIG.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: "json_object" } : undefined,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`AI Error ${response.status}: ${errData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI/Proxy API Error:", error);
      throw error;
    }
  }

  // --- STRATEGY 2: GOOGLE GEMINI SDK (Fallback) ---
  const googleKey = CONFIG.apiKey;
  if (!googleKey) {
    // If we are here, it means we are trying to use Gemini but have no key, 
    // OR we failed to detect the OpenAI config correctly.
    if (!CONFIG.provider || CONFIG.provider === 'gemini') {
        throw new Error("API Key missing. Please check Vercel environment variables (VITE_API_KEY for Google OR VITE_OPENAI_API_KEY for others).");
    }
  }

  const ai = new GoogleGenAI({ apiKey: googleKey! });
  
  // Handle case where user might use an openai model name with gemini provider accidentally
  let modelName = CONFIG.model;
  if (!modelName.includes('gemini') && !modelName.includes('flash')) {
      modelName = 'gemini-2.0-flash-exp';
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: jsonMode ? "application/json" : "text/plain"
    }
  });

  return response.text || "";
};

// Legacy helper for direct client access
export const createAIClient = () => {
  if (!CONFIG.apiKey) throw new Error("Google API Key missing");
  return new GoogleGenAI({ apiKey: CONFIG.apiKey });
};

export const getFriendlyErrorMessage = (error: any): string => {
  const msg = error?.message || error?.toString() || '';
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('Too Many Requests')) {
    return "⏳ Лимит запросов исчерпан (429). Попробуйте позже или смените API ключ.";
  }
  
  if (msg.includes('401') || msg.includes('403') || msg.includes('permission') || msg.includes('key')) {
    return "🔑 Ошибка ключа API. Проверьте настройки Vercel (VITE_OPENAI_API_KEY или VITE_API_KEY).";
  }
  
  if (msg.includes('503') || msg.includes('overloaded')) {
    return "🤖 Сервер ИИ перегружен. Попробуйте через минуту.";
  }
  
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
    return "🌐 Ошибка сети. Проверьте интернет или настройки VPN.";
  }

  return `Ошибка ИИ: ${msg.slice(0, 60)}...`;
};
