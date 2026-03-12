import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';
import { dbRowToPlant, plantToDbParams, updatesToDbParams } from './plant/plantMapper.js';
import { plantCreateSchema, plantUpdateSchema } from './plant/plantValidation.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '2mb' }));

const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : true,
  })
);

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

app.get('/api/plants', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM plants ORDER BY updated_at DESC');
  res.json(rows.map(dbRowToPlant));
});

app.get('/api/plants/:id', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM plants WHERE id = ? LIMIT 1', [id]);
  const row = rows[0];
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(dbRowToPlant(row));
});

app.post('/api/plants', async (req, res) => {
  const parsed = plantCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

  const p = parsed.data;
  const params = plantToDbParams(p);

  await pool.query(
    `INSERT INTO plants (id, name, variety, planted_date, location, notes, image_url, ai_data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?)`,
    [params.id, params.name, params.variety, params.planted_date, params.location, params.notes, params.image_url, params.ai_data, params.created_at, params.updated_at]
  );

  const [rows] = await pool.query('SELECT * FROM plants WHERE id = ? LIMIT 1', [p.id]);
  res.status(201).json(dbRowToPlant(rows[0]));
});

app.put('/api/plants/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = plantUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

  const updates = {
    ...parsed.data,
    updatedAt: new Date(),
  };
  const params = updatesToDbParams(updates);

  const keys = Object.keys(params);
  const values = Object.values(params);
  
  if (keys.length === 0) return res.status(400).json({ error: 'No updates provided' });

  const setParts = keys.map(() => '?').join(', ');
  const columnNames = keys.join(', ').replace(/_/g, (match, offset, str) => {
    // Convert key names back to db column names
    return match;
  });
  
  // Reconstruct column assignment (key = ?)
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  
  values.push(new Date().toISOString().slice(0, 23).replace('T', ' '));
  values.push(id);

  const [result] = await pool.query(
    `UPDATE plants SET ${setClause}, updated_at = ? WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

  const [rows] = await pool.query('SELECT * FROM plants WHERE id = ? LIMIT 1', [id]);
  res.json(dbRowToPlant(rows[0]));
});

app.delete('/api/plants/:id', async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM plants WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ API listening on http://localhost:${port}`);
});

