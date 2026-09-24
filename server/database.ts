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
        CREATE TABLE IF NOT EXISTS user_feedback (
          id BIGSERIAL PRIMARY KEY,
          firebase_uid TEXT NOT NULL,
          email TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'suggestion',
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          page_context TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT user_feedback_user_fk
            FOREIGN KEY (firebase_uid) REFERENCES app_users(firebase_uid) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx
          ON user_feedback(created_at DESC);
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

export interface CloudWorkspaceDocument {
  payload: Record<string, unknown>;
  updatedAt: string;
}

interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export async function createUserFeedback(
  user: AuthenticatedUser,
  input: { category: string; subject: string; message: string; pageContext?: string },
): Promise<{ id: string; createdAt: string }> {
  await upsertAppUser(user);
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO user_feedback (firebase_uid, email, category, subject, message, page_context)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [user.uid, user.email || '', input.category, input.subject, input.message, input.pageContext || ''],
  );
  return { id: String(result.rows[0].id), createdAt: new Date(result.rows[0].created_at).toISOString() };
}

export async function listUserFeedback(limit = 100): Promise<Array<Record<string, unknown>>> {
  await ensureDatabaseSchema();
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, email, category, subject, message, page_context, status, created_at
     FROM user_feedback ORDER BY created_at DESC LIMIT $1`,
    [Math.max(1, Math.min(limit, 200))],
  );
  return result.rows;
}

async function upsertAppUser(user: AuthenticatedUser): Promise<void> {
  await ensureDatabaseSchema();
  const pool = await getPool();
  await pool.query(
    `INSERT INTO app_users (firebase_uid, email, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (firebase_uid) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = EXCLUDED.display_name,
       updated_at = NOW()`,
    [user.uid, user.email || '', user.displayName || ''],
  );
}

export async function loadWorkspaceDocument(user: AuthenticatedUser): Promise<CloudWorkspaceDocument | null> {
  await upsertAppUser(user);
  const pool = await getPool();
  const result = await pool.query(
    `SELECT payload, updated_at
     FROM workspace_documents
     WHERE firebase_uid = $1 AND document_type = 'workspace'`,
    [user.uid],
  );
  if (!result.rows[0]) return null;
  return {
    payload: result.rows[0].payload || {},
    updatedAt: new Date(result.rows[0].updated_at).toISOString(),
  };
}

export async function saveWorkspaceDocument(
  user: AuthenticatedUser,
  payload: Record<string, unknown>,
): Promise<CloudWorkspaceDocument> {
  await upsertAppUser(user);
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO workspace_documents (firebase_uid, document_type, payload, updated_at)
     VALUES ($1, 'workspace', $2::jsonb, NOW())
     ON CONFLICT (firebase_uid, document_type) DO UPDATE SET
       payload = EXCLUDED.payload,
       updated_at = NOW()
     RETURNING payload, updated_at`,
    [user.uid, JSON.stringify(payload)],
  );
  return {
    payload: result.rows[0].payload || {},
    updatedAt: new Date(result.rows[0].updated_at).toISOString(),
  };
}

export async function migrateOrLoadWorkspace(
  user: AuthenticatedUser,
  localPayload: Record<string, unknown>,
  hasLocalData: boolean,
): Promise<CloudWorkspaceDocument & { source: 'cloud' | 'migrated' | 'initialized' }> {
  const existing = await loadWorkspaceDocument(user);
  if (existing) return { ...existing, source: 'cloud' };
  const saved = await saveWorkspaceDocument(user, localPayload);
  return { ...saved, source: hasLocalData ? 'migrated' : 'initialized' };
}
