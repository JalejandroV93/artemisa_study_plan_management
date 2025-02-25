// src/components/subjects/FormSchemas.tsx
import { z } from "zod";

// --- Schemas ---
export const benchmarkSchema = z.object({
  id: z.string().uuid(), // ALWAYS include ID for array items!
  description: z.string().min(1, "Benchmark description is required"),
  learningEvidence: z.array(z.string()).optional(),
  thematicComponents: z.array(z.string()).optional(),
});

export const trimesterFormSchema = z.object({
  id: z.string().uuid(), // ALWAYS include ID for array items!
  number: z.number(), // Keep number
  benchmarks: z.array(benchmarkSchema).optional(), // Optional at this level.
});

export const gradeOfferingSchema = z.object({
  id: z.string().uuid().optional(), // Keep ID, use UUIDs.
  gradeId: z.string().uuid(),      // Keep gradeId.  This is important.
  finalReport: z.string().optional(),
  trimesters: z.array(trimesterFormSchema), // Use array, NOT record, for trimesters
});

// Main Subject Schema
const baseSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.array(z.string()).optional(),
  didactics: z.string().optional(),
  crossCuttingProjects: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional(),
});

// Create Subject Schema
export const createSubjectSchema = baseSubjectSchema.extend({
  gradeOfferings: z.array(gradeOfferingSchema).default([]), // Use array.default([])
});

// Update Subject Schema
export const updateSubjectSchema = baseSubjectSchema.extend({
  gradeOfferings: z.array(gradeOfferingSchema).optional(),
}).partial();

export type SubjectFormValues = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectFormValues = z.infer<typeof updateSubjectSchema>;