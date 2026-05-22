import { getDb } from "../lib/db.js";
import { setCors } from "../lib/cors.js";

export default async function handler(req, res) {
  // CORS preflight managing
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Metodo non consentito" });

  const { email, nome } = req.body;

  if (!email || !nome) {
    return res.status(400).json({ error: "Email e nome sono obbligatori." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato email non valido." });
  }

  try {
    const db = await getDb();
    const utenti = db.collection("utenti");
    const key = email.toLowerCase().trim();

    // Create user if not exists (upsert)
    await utenti.updateOne(
      { email: key },
      {
        $setOnInsert: {
          email: key,
          nome: nome.trim(),
          creatoIl: new Date(),
        },
      },
      { upsert: true },
    );

    const utente = await utenti.findOne(
      { email: key },
      { projection: { _id: 0, email: 1, nome: 1 } },
    );

    return res.status(200).json(utente);
  } catch (err) {
    console.error("Errore login:", err);
    return res.status(500).json({ error: "Errore interno del server." });
  }
}
