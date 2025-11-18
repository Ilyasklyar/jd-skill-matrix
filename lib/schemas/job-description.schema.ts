import { z } from "zod";

export const jobDescriptionSchema = z.object({
  jobDescription: z
    .string()
    .min(
      100,
      "Please provide a more detailed job description (at least 100 characters)"
    ),
});
