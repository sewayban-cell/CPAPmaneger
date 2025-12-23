
import { GoogleGenAI } from "@google/genai";

export const recognizeSerialNumber = async (base64Image: string): Promise<string> => {
  // 動態獲取，確保代碼執行到這裡時環境變數已就緒
  const getApiKey = () => {
    try {
      return (process as any).env.API_KEY || "";
    } catch (e) {
      return "";
    }
  };

  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("API Key 未配置");
    throw new Error("系統未配置 API Key，請檢查環境變數。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  
  const textPart = {
    text: "這是一張醫療器材標籤的照片。請辨識並提取其中的序號 (Serial Number, SN)。只返回純序號字串，不要包含標題或其他文字。如果找不到序號，請返回空字串。"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0,
        maxOutputTokens: 30,
      }
    });

    const text = response.text;
    return text ? text.trim() : "";
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("OCR 辨識失敗，請嘗試手動輸入。");
  }
};
