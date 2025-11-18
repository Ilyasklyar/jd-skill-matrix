import { z } from "zod";

export const skillMatrixSchema = z.object({
  title: z.string(),
  seniority: z.enum(["junior", "mid", "senior", "lead", "unknown"]),
  skills: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    devops: z.array(z.string()),
    web3: z.array(z.string()),
    other: z.array(z.string()),
  }),
  mustHave: z.array(z.string()),
  niceToHave: z.array(z.string()),
  salary: z
    .object({
      currency: z.enum(["USD", "EUR", "PLN", "GBP"]),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  summary: z
    .string()
    .refine(
      (val) => val.trim().split(/\s+/).length <= 60,
      "Summary must be ≤ 60 words"
    ),
});

export type SkillMatrix = z.infer<typeof skillMatrixSchema>;
