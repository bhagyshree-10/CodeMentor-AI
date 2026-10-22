import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { getDb } from './db';
import { env } from './env';
import { logger } from './logger';

let authInstance: any = null;

function getAllowedHosts(): string[] {
  const hosts = new Set<string>();
  const addHost = (urlStr?: string) => {
    if (!urlStr) return;
    try {
      const u = new URL(urlStr);
      hosts.add(u.host);
      hosts.add(u.hostname);
    } catch {
      // ignore
    }
  };

  addHost(env.APP_ORIGIN);
  addHost(env.BETTER_AUTH_URL);

  if (process.env.NODE_ENV !== 'production') {
    hosts.add('localhost:3000');
    hosts.add('localhost:3001');
    hosts.add('localhost:3002');
    hosts.add('localhost');
    hosts.add('127.0.0.1:3000');
    hosts.add('127.0.0.1:3001');
    hosts.add('127.0.0.1:3002');
    hosts.add('127.0.0.1');
  }

  return Array.from(hosts);
}

function getTrustedOrigins(): (request?: Request) => string[] {
  return (request?: Request) => {
    const origins = new Set<string>();
    if (env.APP_ORIGIN) origins.add(env.APP_ORIGIN);
    if (env.BETTER_AUTH_URL) origins.add(env.BETTER_AUTH_URL);

    if (process.env.NODE_ENV !== 'production') {
      origins.add('http://localhost:3000');
      origins.add('http://localhost:3001');
      origins.add('http://localhost:3002');
      origins.add('http://127.0.0.1:3000');
      origins.add('http://127.0.0.1:3001');
      origins.add('http://127.0.0.1:3002');
      const reqOrigin = request?.headers?.get('origin');
      if (reqOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(reqOrigin)) {
        origins.add(reqOrigin);
      }
    }
    return Array.from(origins);
  };
}

export async function getAuthInstance() {
  if (authInstance) return authInstance;

  const db = await getDb();
  const adapter = mongodbAdapter(db);

  authInstance = betterAuth({
    database: adapter,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: {
      allowedHosts: getAllowedHosts(),
      fallback: env.BETTER_AUTH_URL,
    },
    trustedOrigins: getTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        storeCode: {
          type: 'boolean',
          required: false,
          defaultValue: true,
        },
      },
    },
  });

  return authInstance;
}
