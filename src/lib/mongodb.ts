import { MongoClient, Db } from "mongodb";

const uri =
  process.env.NODE_ENV === "development"
    ? (process.env.MONGODB_LOCAL_URI ?? process.env.MONGODB_URI)
    : process.env.MONGODB_URI;

if (!uri)
  throw new Error(
    "Please define MONGODB_URI or MONGODB_LOCAL_URI in your .env file",
  );

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = {};

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
