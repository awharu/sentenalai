import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post("/api/analyze-frame", async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image" });
    }

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this security camera frame. Identify any persons, vehicles, or potential security threats. If license plates are visible, attempt to read them. Return a JSON object with properties: detectedObjects (string array), threatLevel (LOW, MEDIUM, HIGH), description (string), licensePlates (string array), facesDetected (number)."
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
          },
          required: ["detectedObjects", "threatLevel", "description"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    res.status(500).json({ error: "Analysis failed", details: error instanceof Error ? error.message : String(error) });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
