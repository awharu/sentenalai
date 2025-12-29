import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

export const analyzeFrame = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    // Removing the header if present to get raw base64
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this security camera frame. Identify any persons, vehicles, or potential security threats. If license plates are visible, attempt to read them. Return a JSON object."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedObjects: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            threatLevel: {
              type: Type.STRING,
              enum: ["LOW", "MEDIUM", "HIGH"]
            },
            description: { type: Type.STRING },
            licensePlates: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            facesDetected: { type: Type.NUMBER }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Return a safe fallback to prevent UI crash
    return {
        detectedObjects: [],
        threatLevel: 'LOW',
        description: "Analysis failed due to error."
    };
  }
};