import { z } from "zod";

export const createPantrySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  quantity: z.number().min(0).optional().default(1),
  unit: z.string().max(20).optional().default("pcs"),
  expirationDate: z.string().optional().nullable(),
});

export const updatePantrySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().max(20).optional(),
  expirationDate: z.string().optional().nullable(),
  isUsed: z.boolean().optional(),
});
