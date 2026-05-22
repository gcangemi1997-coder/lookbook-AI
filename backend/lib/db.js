import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI mancante nel file .env");
}

// In ambiente serverless la connessione viene riutilizzata tra le invocazioni
// grazie alla cache del modulo — evita di aprire una nuova connessione ad ogni request
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db("lookbook");
}
