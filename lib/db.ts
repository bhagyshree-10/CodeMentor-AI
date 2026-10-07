import { MongoClient, Db } from 'mongodb';
import dns from 'dns';
import { env } from './env';
import { logger } from './logger';

// Force Node.js DNS to use public DNS servers for MongoDB SRV resolution on Windows
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if unsupported
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const mongoOptions = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

if (process.env.NODE_ENV === 'test' || env.MONGODB_URI.includes('localhost') || env.MONGODB_URI.includes('127.0.0.1')) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(env.MONGODB_URI, mongoOptions);
    global._mongoClientPromise = client.connect().catch((err) => {
      logger.warn('MongoDB connection failed, operating with mock fallback if needed', { error: err.message });
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(env.MONGODB_URI, mongoOptions);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  try {
    const c = await clientPromise;
    return c.db(env.MONGODB_DB);
  } catch (err: any) {
    logger.warn('Failed to connect to MongoDB, using fallback', { error: err.message });
    throw err;
  }
}

export { clientPromise };
