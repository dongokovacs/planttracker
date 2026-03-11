import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const toBool = (v) => v === '1' || v === 'true' || v === 'yes';

const required = (key) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

const useSsl = toBool(process.env.MYSQL_SSL ?? '');

export const pool = mysql.createPool({
  host: required('MYSQL_HOST'),
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: required('MYSQL_USER'),
  password: required('MYSQL_PASSWORD'),
  database: required('MYSQL_DATABASE'),
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
  namedPlaceholders: true,
  timezone: 'Z',
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

