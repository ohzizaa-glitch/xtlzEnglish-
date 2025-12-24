
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
  // 1. Try to find specific keys first
  const novitaKey = getEnv('VITE_NOVITA_API_KEY');
  const deepseekKey = getEnv('VITE_DEEPSEEK_API_KEY');
  const openAIKey = getEnv('VITE_OPENAI_API_KEY');
  const googleKey = getEnv('VITE_API_KEY') || getEnv('NEXT_PUBLIC_API_KEY');
  
  // 2. Check manual overrides
  let rawProvider = (getEnv('VITE_AI_PROVIDER') || '').toLowerCase().trim();
  let baseUrl = getEnv('VITE_AI_BASE_URL');
  let model = getEnv('VITE_AI_MODEL');
  
  // Internal config variables
  let finalApiKey = '';
  let finalProvider = 'gemini'; // 'gemini' | 'openai' (protocol)
  let finalBaseUrl = 'https://api.openai.com/v1'; // Default for OpenAI protocol

  // --- LOGIC: AUTO-DETECT PROVIDER BASED ON KEYS ---

  if (novitaKey) {
      console.log("ℹ️ Auto-detected Novita AI");
      finalApiKey = novitaKey;
      finalProvider = 'openai'; // Novita uses OpenAI protocol
      if (!baseUrl) finalBaseUrl = 'https://api.novita.ai/v3/openai';
      if (!model) model = 'deepseek/deepseek-v3'; // Default to DeepSeek V3 on Novita
  } 
  else if (deepseekKey) {
      console.log("ℹ️ Auto-detected DeepSeek API");
      finalApiKey = deepseekKey;
      finalProvider = 'openai';
      if (!baseUrl) finalBaseUrl = 'https://api.deepseek.com';
      if (!model) model = 'deepseek-chat';
  }
  else if (openAIKey) {
      // Could be OpenAI, OpenRouter, or a generic provider
      finalApiKey = openAIKey;
      finalProvider = 'openai';
      
      if (rawProvider === 'novita') {
         if (!baseUrl) finalBaseUrl = 'https://api.novita.ai/v3/openai';
         if (!model) model = 'deepseek/deepseek-v3';
      } else if (rawProvider === 'openrouter' || openAIKey.startsWith('sk-or-')) {
         if (!baseUrl) finalBaseUrl = 'https://openrouter.ai/api/v1';
         if (!model) model = 'google/gemini-2.0-flash-exp:free';
      }
  } 
  else if (googleKey) {
      finalApiKey = googleKey;
      finalProvider = 'gemini';
      if (!model) model = 'gemini-2.0-flash-exp';
  }

  // Fallback for manual config overriding everything
  if (rawProvider === 'novita' && !baseUrl) {
      finalBaseUrl = 'https://api.novita.ai/v3/openai';
  }

  return { 
      apiKey: finalApiKey, 
      provider: finalProvider, 
      baseUrl: finalBaseUrl, 
      model: model || 'deepseek/deepseek-v3' 
  };
};

const CONFIG = loadConfig();

/**
 * Universal AI Generation Function
 */
export const generateText = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
  
  // --- STRATEGY 1: OPENAI PROTOCOL (Novita, DeepSeek, OpenRouter, OpenAI) ---
  if (CONFIG.provider === 'openai') {
    if (!CONFIG.apiKey) {
        throw new Error("API Key missing. Please set VITE_NOVITA_API_KEY (or VITE_OPENAI_API_KEY).");
    }
    
    try {
      // console.log(`[AI] Request: ${CONFIG.baseUrl} [${CONFIG.model}]`);
      
      const response = await fetch(`${CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.apiKey}`,
          'HTTP-Referer': 'https://xtlz-english.vercel.app', 
          'X-Title': 'Xtlz English App',
        },
        body: JSON.stringify({
          model: CONFIG.model,
          messages: [{ role: 'user', content: prompt }],
          // Novita/DeepSeek usually support JSON object mode
          response_format: jsonMode ? { type: "json_object" } : undefined,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || errData.message || response.statusText;
        console.error(`[AI] Error:`, errData);
        
        // Handle specific Novita/DeepSeek errors
        if (response.status === 400 && errMsg.includes('json_object')) {
            // Retry without JSON mode if the model doesn't support it strictly
            return generateText(prompt, false); 
        }
        
        throw new Error(`AI Provider Error (${response.status}): ${errMsg}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || "";
      
      // Cleanup: sometimes models return ```json ... ``` blocks even in raw mode
      if (jsonMode && content.includes('```json')) {
          content = content.replace(/```json\n?|```/g, '').trim();
      }

      return content;
    } catch (error) {
      console.error("AI Request Failed:", error);
      throw error;
    }
  }

  // --- STRATEGY 2: GOOGLE GEMINI SDK ---
  if (!CONFIG.apiKey) {
     throw new Error("No API Configuration found. Please add VITE_NOVITA_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: CONFIG.apiKey });
  
  // Safety check to prevent sending DeepSeek model names to Google SDK
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

export const getFriendlyErrorMessage = (error: any): string => {
  const msg = (error?.message || error?.toString() || '').toLowerCase();
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('balance')) {
    return "⏳ Баланс исчерпан или лимит запросов (429). Проверьте баланс Novita.";
  }
  
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized')) {
    return "🔑 Ошибка ключа API. Проверьте правильность VITE_NOVITA_API_KEY.";
  }

  if (msg.includes('not found') || msg.includes('404')) {
      return "🔍 Модель не найдена. Возможно, Novita изменила название модели.";
  }
  
  if (msg.includes('fetch') || msg.includes('network')) {
    return "🌐 Ошибка сети. Проверьте интернет.";
  }

  return `Ошибка ИИ: ${msg.slice(0, 100)}...`;
};
