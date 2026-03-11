export function dbRowToPlant(row) {
  return {
    id: row.id,
    name: row.name,
    variety: row.variety ?? undefined,
    plantedDate: new Date(row.planted_date),
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    imageUrl: row.image_url ?? undefined,
    aiData: row.ai_data ? jsonParseSafe(row.ai_data) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function jsonParseSafe(v) {
  if (v == null) return undefined;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
}

export function plantToDbParams(plant) {
  return {
    id: plant.id,
    name: plant.name,
    variety: plant.variety ?? null,
    planted_date: toMysqlDate(plant.plantedDate),
    location: plant.location ?? null,
    notes: plant.notes ?? null,
    image_url: plant.imageUrl ?? null,
    ai_data: plant.aiData ? JSON.stringify(plant.aiData) : null,
    created_at: toMysqlDate(plant.createdAt),
    updated_at: toMysqlDate(plant.updatedAt),
  };
}

export function updatesToDbParams(updates) {
  const out = {};
  if (updates.name !== undefined) out.name = updates.name;
  if (updates.variety !== undefined) out.variety = updates.variety ?? null;
  if (updates.plantedDate !== undefined) out.planted_date = toMysqlDate(updates.plantedDate);
  if (updates.location !== undefined) out.location = updates.location ?? null;
  if (updates.notes !== undefined) out.notes = updates.notes ?? null;
  if (updates.imageUrl !== undefined) out.image_url = updates.imageUrl ?? null;
  if (updates.aiData !== undefined) out.ai_data = updates.aiData ? JSON.stringify(updates.aiData) : null;
  if (updates.updatedAt !== undefined) out.updated_at = toMysqlDate(updates.updatedAt);
  return out;
}

function toMysqlDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return date.toISOString().slice(0, 23).replace('T', ' ');
}

