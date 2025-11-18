import { SkillMatrix } from "../schemas/skill-matrix.schema";

export async function extractJobDescription(jobDescription: string): Promise<SkillMatrix> {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unknown error");
  return data;
}
