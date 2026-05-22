import { getDb } from "../../lib/db.js";
import { setCors } from "../../lib/cors.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Metodo non consentito" });

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email mancante." });
  }

  try {
    const db = await getDb();
    const utenti = db.collection("utenti");
    const key = decodeURIComponent(email).toLowerCase().trim();

    const utente = await utenti.findOne(
      { email: key },
      { projection: { _id: 0, valutazioni: 1 } },
    );

    if (!utente) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    return res.status(200).json(utente.valutazioni ?? []);
  } catch (err) {
    console.error("Errore history:", err);
    return res.status(500).json({ error: "Errore interno del server." });
  }
}
