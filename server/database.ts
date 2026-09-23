import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';

let poolPromise: Promise<Pool> | null = null;
let schemaPromise: Promise<void> | null = null;

async function createPool(): Promise<Pool> {
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
  const user = process.env.DB_IAM_USER;
  const database = process.env.DB_NAME || 'resume_pilot';
  if (!instanceConnectionName || !user) {
    throw new Error('Database connection environment is not configured.');
  }

  const connector = new Connector();
  const connectionOptions = await connector.getOptions({
    instanceConnectionName,
    ipType: IpAddressTypes.PUBLIC,
    authType: AuthTypes.IAM,
  });
  const pool = new Pool({
    ...connectionOptions,
    user,
    database,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  });
  pool.once('end', () => connector.close());
  return pool;
}

function getPool(): Promise<Pool> {
  if (!poolPromise) poolPromise = createPool().catch(error => {
    poolPromise = null;
    throw error;
  });
  return poolPromise;
}

export async function ensureDatabaseSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const pool = await getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_users (
          firebase_uid TEXT PRIMARY KEY,
          email TEXT NOT NULL DEFAULT '',
          display_name TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS workspace_documents (
          firebase_uid TEXT NOT NULL,
          document_type TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (firebase_uid, document_type),
          CONSTRAINT workspace_documents_user_fk
            FOREIGN KEY (firebase_uid) REFERENCES app_users(firebase_uid) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS workspace_documents_updated_at_idx
          ON workspace_documents(updated_at DESC);
      `);
    })().catch(error => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

export async function getDatabaseStatus(): Promise<'connected' | 'not_configured' | 'error'> {
  if (!process.env.INSTANCE_CONNECTION_NAME || !process.env.DB_IAM_USER) return 'not_configured';
  try {
    await ensureDatabaseSchema();
    const pool = await getPool();
    await pool.query('SELECT 1');
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error instanceof Error ? error.message : error);
    return 'error';
  }
}
