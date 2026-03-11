import { z } from 'zod';

const dateLike = z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v : new Date(v)));

export const plantCreateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  variety: z.string().optional(),
  plantedDate: dateLike,
  location: z.string().optional(),
  notes: z.string().optional(),
  // Accept relative paths like "/images/retek.jpg" as well as full URLs
  imageUrl: z.string().min(1).optional(),
  aiData: z.unknown().optional(),
  createdAt: dateLike,
  updatedAt: dateLike,
});

export const plantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  variety: z.string().optional().nullable(),
  plantedDate: dateLike.optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Accept relative paths like "/images/retek.jpg" as well as full URLs
  imageUrl: z.string().min(1).optional().nullable(),
  aiData: z.unknown().optional().nullable(),
}).strict();

