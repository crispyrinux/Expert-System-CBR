import { z } from 'zod';

export const addSymptomsSchema = z.object({
  symptoms: z.array(z.string().min(1, "Symptom ID cannot be empty"))
    .min(1, "At least one symptom is required")
    .refine((items) => new Set(items).size === items.length, {
      message: "Symptoms must not contain duplicates",
    }),
});
