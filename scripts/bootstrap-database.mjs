import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import pg from 'pg';

const { Pool } = pg;
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const adminPassword = process.env.DB_BOOTSTRAP_PASSWORD;
const appDatabase = process.env.DB_NAME || 'resume_pilot';
const iamUser = process.env.DB_IAM_USER;

if (!instanceConnectionName || !adminPassword || !iamUser) {
  throw new Error('Missing database bootstrap environment.');
}
if (!/^[a-z0-9@._-]+$/i.test(iamUser) || !/^[a-z0-9_-]+$/i.test(appDatabase)) {
  throw new Error('Unsafe database identifier.');
}

const connector = new Connector();
const connectionOptions = await connector.getOptions({
  instanceConnectionName,
  ipType: IpAddressTypes.PUBLIC,
});

async function withAdminPool(database, action) {
  const pool = new Pool({
    ...connectionOptions,
    user: 'postgres',
    password: adminPassword,
    database,
    max: 1,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await action(pool);
  } finally {
    await pool.end();
  }
}

try {
  await withAdminPool(appDatabase, async pool => {
    await pool.query(`GRANT CONNECT ON DATABASE "${appDatabase}" TO "${iamUser}"`);
    await pool.query(`GRANT USAGE, CREATE ON SCHEMA public TO "${iamUser}"`);
  });
  console.log('Database connection and schema permissions initialized.');
} finally {
  connector.close();
}
