
import { GoogleGenAI } from "@google/genai";

export const recognizeSerialNumber = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("OCR 辨識失敗，請手動輸入。");
  }
};
