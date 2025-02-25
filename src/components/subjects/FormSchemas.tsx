// src/components/subjects/FormSchemas.tsx
import { z } from "zod";

// --- Schemas ---
export const benchmarkSchema = z.object({
  id: z.string().optional(), // Include ID for updates
  description: z.string().min(1, "Benchmark description is required"),
  learningEvidence: z.array(z.string()).optional(),
  thematicComponents: z.array(z.string()).optional(),
});

export const trimesterFormSchema = z.object({
  number: z.number(),   //Added Number
  benchmarks: z.array(benchmarkSchema).optional(),
});

export const gradeOfferingSchema = z.object({
  id: z.string().optional(),// Include ID for updates.
  gradeId: z.string(),      //Keep gradeId
  finalReport: z.string().optional(),
  trimesters: z.record(z.string(), trimesterFormSchema).optional(), // Make trimesters optional *here*
  groups: z.array(z.object({ name: z.string()})).optional() // Group
});

// Main Subject Schema
const baseSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.array(z.string()).optional(),
  didactics: z.string().optional(), //Changed to string
  crossCuttingProjects: z.array(z.string().uuid()).optional(),  // Array of Project IDs
  isActive: z.boolean().optional(),
});


// Create Subject Schema (stricter, for POST)
export const createSubjectSchema = baseSubjectSchema.extend({
  gradeOfferings: z.record(z.string(), gradeOfferingSchema).default({}), // Keep .default({})
});

// Update Subject Schema (more permissive, for PUT)
export const updateSubjectSchema = baseSubjectSchema.extend({
    gradeOfferings: z.record(z.string(), gradeOfferingSchema).optional(), // Optional for updates
}).partial();  // .partial() makes all fields of the *base* schema optional.


export type SubjectFormValues = z.infer<typeof createSubjectSchema>; // Export Types
export type UpdateSubjectFormValues = z.infer<typeof updateSubjectSchema>