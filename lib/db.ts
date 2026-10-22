import { MongoClient, Db } from 'mongodb';
import dns from 'dns';
import { env } from './env';
import { logger } from './logger';

// Set public DNS fallback for Node.js DNS resolution
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if unsupported in environment
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClientInstance: MongoClient | undefined;
}

const mongoOptions = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

async function resolveDirectUriIfNeeded(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }
  const match = uri.match(/^mongodb\+srv:\/\/([^@]+@)?([^\/\?]+)(\/[^\?]*)?(\?.*)?$/);
  if (!match) {
    return uri;
  }
  try {
    const [, auth, host, dbPath, query] = match;
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const srvs = await resolver.resolveSrv('_mongodb._tcp.' + host);
    if (!srvs || srvs.length === 0) return uri;
    const txts = await resolver.resolveTxt(host).catch(() => []);
    const hosts = srvs.map((s) => `${s.name}:${s.port}`).join(',');
    const txtParams = txts.flat().join('&');
    const baseParams = 'ssl=true';
    const extraParams = [baseParams, txtParams, query ? query.replace(/^\?/, '') : '']
      .filter(Boolean)
      .join('&');
    return `mongodb://${auth || ''}${hosts}${dbPath || '/'}${extraParams ? '?' + extraParams : ''}`;
  } catch (err: any) {
    logger.warn('Direct SRV resolution fallback skipped', { error: err?.message });
    return uri;
  }
}

async function createClient(): Promise<MongoClient> {
  let uriToUse = env.MONGODB_URI;
  if (uriToUse.startsWith('mongodb+srv://')) {
    try {
      uriToUse = await resolveDirectUriIfNeeded(uriToUse);
    } catch (err: any) {
      logger.warn('Initial SRV pre-resolution skipped', { error: err?.message });
    }
  }

  try {
    const client = new MongoClient(uriToUse, mongoOptions);
    await client.connect();
    return client;
  } catch (err: any) {
    logger.error('Failed to connect to MongoDB', { error: err?.message });
    throw err;
  }
}

export function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const promise = createClient()
      .then((client) => {
        global._mongoClientInstance = client;
        return client;
      })
      .catch((err) => {
        // Reset cache so subsequent requests can retry
        global._mongoClientPromise = undefined;
        global._mongoClientInstance = undefined;
        throw err;
      });
    global._mongoClientPromise = promise;
  }
  return global._mongoClientPromise;
}

export async function closeDb(): Promise<void> {
  if (global._mongoClientPromise) {
    try {
      const client = await global._mongoClientPromise;
      await client.close();
    } catch {
      // Ignore errors on close
    }
    global._mongoClientPromise = undefined;
    global._mongoClientInstance = undefined;
  }
}

export async function getDb(): Promise<Db> {
  try {
    const c = await getClientPromise();
    return c.db(env.MONGODB_DB);
  } catch (err: any) {
    logger.warn('Failed to connect to MongoDB', { error: err.message });
    throw err;
  }
}

export const clientPromise: Promise<MongoClient> = {
  then<TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return getClientPromise().then(onfulfilled, onrejected);
  },
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<MongoClient | TResult> {
    return getClientPromise().catch(onrejected);
  },
  finally(onfinally?: (() => void) | null): Promise<MongoClient> {
    return getClientPromise().finally(onfinally);
  },
} as Promise<MongoClient>;
