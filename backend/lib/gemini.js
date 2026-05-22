import { validateEvaluationJson } from "./validate.js";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `
You are the official AI assistant for LookBook, an Italian marketplace for sustainable second-hand fashion.

CRITICAL SAFETY RULE:
First, analyze the uploaded image. If the image does NOT show a clothing item, shoes, bags, or fashion accessories, you must immediately reject it.

In case of rejection, respond EXCLUSIVELY with this JSON format:
{
  "error_non_clothing": true,
  "motivation": "Spiacenti, l'oggetto caricato non sembra essere un capo d'abbigliamento o un accessorio di moda. Carica un'immagine pertinente."
}

If the image IS a clothing item or fashion accessory, estimate a realistic price considering:
- the uploaded image
- category
- brand
- item condition

You must respond EXCLUSIVELY with a valid JSON object following this format:
{
  "suggested_price": 25,
  "range": {
    "min": 20,
    "max": 30
  },
  "motivation": "Spiegazione dettagliata in italiano",
  "selling_tips": ["consiglio 1", "consiglio 2", "consiglio 3"]
}

Rules:
- Response must be pure JSON
- No markdown
- No backticks
- Motivation must be in Italian
- suggested_price, range.min and range.max must be integers
- suggested_price must be between min and max
- selling_tips must contain exactly 3 strings
`;

export async function callGemini({
  category,
  brand,
  status,
  imageBase64,
  imageMimeType,
}) {
  const userPrompt = `Esegui la valutazione per questo capo d'abbigliamento:
- Categoria: ${category}
- Brand: ${brand}
- Stato Attuale: ${status}

Analizza anche l'immagine del capo.

ATTENZIONE:
Rispondi ESCLUSIVAMENTE con l'oggetto JSON richiesto.
Non inserire testo prima o dopo.
Non usare blocchi di codice markdown con tre backtick.`.trim();

  const apiPayload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        parts: [
          { text: userPrompt },
          {
            inlineData: {
              mimeType: imageMimeType || "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  };

  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const googleResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    if (!googleResponse.ok) {
      const errText = await googleResponse.text();

      if (googleResponse.status === 503 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      throw new Error(`Gemini error ${googleResponse.status}: ${errText}`);
    }

    const googleData = await googleResponse.json();

    if (!googleData.candidates?.[0]?.content?.parts?.[0]?.text) {
      if (attempt < MAX_RETRIES) continue;
      throw new Error("Struttura risposta Gemini non valida");
    }

    let rawText = googleData.candidates[0].content.parts[0].text.trim();

    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      if (attempt < MAX_RETRIES) continue;
      throw new Error("Risposta Gemini non parsabile come JSON");
    }

    const validation = validateEvaluationJson(parsed);
    if (!validation.valid) {
      if (attempt < MAX_RETRIES) continue;
      throw new Error(`Struttura JSON non valida: ${validation.message}`);
    }

    return parsed;
  }
}
