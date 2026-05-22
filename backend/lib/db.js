import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI mancante nel file .env");
}

// In a serverless environment, the connection is reused between invocations
// thanks to the module’s cache — this avoids opening a new connection for every request
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
