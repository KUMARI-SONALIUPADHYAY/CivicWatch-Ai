import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, IssueCategory, Report, IssueStatus } from "../types";

// 🔹 Load API Key from Vite environment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 🔹 Safety check
if (!API_KEY) {
  throw new Error("Gemini API key missing — add VITE_GEMINI_API_KEY in .env or .env.local");
}

// --------------------------------------
// AI HAZARD ANALYSIS
// --------------------------------------
export const analyzeRoadIssue = async (base64Image: string): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          text: `You are a professional road safety and civic infrastructure inspector.
          Analyze the provided image.

          TASKS:
          1. Determine if this is a genuine road safety or civic infrastructure issue.
          2. Reject fake, irrelevant, blurred or unrelated images.
          3. If valid, classify the hazard.
          4. Assign severity (LOW, MEDIUM, HIGH, CRITICAL).
          5. Output a confidence score (0-100).
          6. Provide safety impact + technical description.
          7. Estimate repair cost.
          8. Generate a short AI Safety Insight.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1]
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValidIssue: { type: Type.BOOLEAN },
          category: { type: Type.STRING, enum: Object.values(IssueCategory) },
          severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          description: { type: Type.STRING },
          estimatedRepairCost: { type: Type.STRING },
          publicSafetyImpact: { type: Type.STRING },
          safetyInsight: { type: Type.STRING },
          confidenceScore: { type: Type.INTEGER },
          rejectionReason: { type: Type.STRING }
        },
        required: [
          "isValidIssue",
          "category",
          "severity",
          "description",
          "estimatedRepairCost",
          "publicSafetyImpact",
          "safetyInsight",
          "confidenceScore"
        ]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as AIAnalysis;
};

// --------------------------------------
// AI RE-INSPECTION (Before vs After)
// --------------------------------------
export const reInspectHazard = async (
  originalImage: string,
  followUpImage: string
): Promise<{ isResolved: boolean; confidence: number; summary: string }> => {

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: `Compare BEFORE and AFTER images.
        Decide if the hazard is fixed.
        Output: isResolved, confidence, summary.` },
        { inlineData: { mimeType: "image/jpeg", data: originalImage.split(",")[1] } },
        { inlineData: { mimeType: "image/jpeg", data: followUpImage.split(",")[1] } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isResolved: { type: Type.BOOLEAN },
          confidence: { type: Type.INTEGER },
          summary: { type: Type.STRING }
        },
        required: ["isResolved", "confidence", "summary"]
      }
    }
  });

  return JSON.parse(response.text?.trim() || "{}");
};

// --------------------------------------
// AI EMAIL TO MUNICIPAL AUTHORITY
// --------------------------------------
export const generateAuthorityEmail = async (report: Report): Promise<string> => {
  if (!report.analysis) return "No analysis available.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const googleMapsUrl = `https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`;
  const baseUrl = window.location.origin;

  const inProgressUrl = `${baseUrl}?action=updateStatus&id=${report.id}&token=${report.authorityToken}&status=${IssueStatus.IN_PROGRESS}`;
  const resolvedUrl = `${baseUrl}?action=updateStatus&id=${report.id}&token=${report.authorityToken}&status=${IssueStatus.RESOLVED}`;
  const rejectedUrl = `${baseUrl}?action=updateStatus&id=${report.id}&token=${report.authorityToken}&status=${IssueStatus.REJECTED}`;

  const prompt = `
  Generate an urgent municipal maintenance email.

  ISSUE TYPE: ${report.analysis.category}
  LOCATION: ${report.location.lat}, ${report.location.lng}
  MAP: ${googleMapsUrl}
  SEVERITY: ${report.analysis.severity}
  CONFIDENCE: ${report.analysis.confidenceScore}%
  SAFETY IMPACT: ${report.analysis.publicSafetyImpact}

  - Description: ${report.analysis.description}
  - Estimated Cost: ${report.analysis.estimatedRepairCost}

  ACTION LINKS:
  - In Progress: ${inProgressUrl}
  - Resolved: ${resolvedUrl}
  - Rejected: ${rejectedUrl}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { temperature: 0.2 }
  });

  return response.text || "Authority Action Required.";
};
