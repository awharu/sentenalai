import { AnalysisResult } from "../types";

export const analyzeFrame = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch("/api/analyze-frame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to analyze frame");
    }

    const result = await response.json();
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Return a safe fallback to prevent UI crash
    return {
        detectedObjects: [],
        threatLevel: 'LOW',
        description: "Analysis failed due to a server error."
    };
  }
};
