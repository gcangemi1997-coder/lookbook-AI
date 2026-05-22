import { getDb } from "../lib/db.js";
import { callGemini } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Metodo non consentito" });

  const { category, brand, status, imageBase64, imageMimeType, email } =
    req.body;

  if (!category || !brand || !status || !imageBase64 || !email) {
    return res.status(400).json({ error: "Campi obbligatori mancanti." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Chiave API Gemini mancante." });
  }

  try {
    // Chiama Gemini
    const evaluation = await callGemini({
      category,
      brand,
      status,
      imageBase64,
      imageMimeType,
    });

    // Se l'immagine non è un capo, restituisci subito senza salvare
    if (evaluation.error_non_clothing) {
      return res.status(200).json(evaluation);
    }

    // Salva la valutazione nel profilo utente su MongoDB
    const db = await getDb();
    const utenti = db.collection("utenti");
    const key = email.toLowerCase().trim();

    const record = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      inputs: { category, brand, status },
      evaluation,
    };

    await utenti.updateOne({ email: key }, { $push: { valutazioni: record } });

    return res.status(200).json(evaluation);
  } catch (err) {
    console.error("Errore evaluate:", err);

    if (err.message?.includes("503")) {
      return res
        .status(503)
        .json({
          error:
            "Servizio AI momentaneamente non disponibile. Riprova tra poco.",
        });
    }

    return res
      .status(500)
      .json({ error: "Errore interno del server.", details: err.message });
  }
}
