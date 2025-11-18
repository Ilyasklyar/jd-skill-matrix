import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { skillMatrixSchema } from "@/lib/schemas/skill-matrix.schema";
import { fallbackParser } from "@/lib/fallback-parser";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (jobDescription.trim().length < 100) {
      return NextResponse.json(
        { error: "Job description must be at least 100 characters" },
        { status: 400 }
      );
    }

    let result;

    if (process.env.OPENAI_API_KEY) {
      try {
        result = await extractWithAI(jobDescription);
      } catch {
        result = fallbackParser(jobDescription);
      }
    } else {
      result = fallbackParser(jobDescription);
    }

    const validation = skillMatrixSchema.safeParse(result);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((err) => err.message)
        .join("; ");

      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }

    return NextResponse.json(validation.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function extractWithAI(jobDescription: string) {
  const systemPrompt = `You are a job description parser. Extract structured data as JSON matching this schema:
  {
    "title": string,
    "seniority": "junior" | "mid" | "senior" | "lead" | "unknown",
    "skills": {
      "frontend": string[],
      "backend": string[],
      "devops": string[],
      "web3": string[],
      "other": string[]
    },
    "mustHave": string[],
    "niceToHave": string[],
    "salary": { "currency": "USD"|"EUR"|"PLN"|"GBP", "min"?: number, "max"?: number },
    "summary": string
  }

  RULES:
  1) Return ONLY valid JSON, no markdown, no explanation, no extra fields.
  2) "summary" must be a short text based on the job description, include role, top relevant skills, seniority if present, and salary if present, and MUST NOT exceed 60 words.
  3) If a field cannot be inferred, return an empty array (for arrays), "unknown" (for seniority), or omit optional salary.
  4) Use arrays for lists, strings for text fields, numbers for salary min/max.

  Parse the job description below and return JSON strictly matching the schema.`;

  let response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: jobDescription },
    ],
    temperature: 0.1,
  });

  let content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  if (parsed.summary && typeof parsed.summary === "string") {
    parsed.summary = parsed.summary.trim().split(/\s+/).slice(0, 60).join(" ");
  }

  let validation = skillMatrixSchema.safeParse(parsed);
  if (validation.success) return validation.data;

  const fixPrompt = `The previous JSON had validation errors: ${JSON.stringify(
    validation.error.issues
  )}. Please fix it to match the schema exactly, return ONLY valid JSON.`;

  response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: jobDescription },
      { role: "assistant", content },
      { role: "user", content: fixPrompt },
    ],
    temperature: 0.1,
  });

  content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Retry: OpenAI returned empty content");

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Retry: OpenAI returned invalid JSON");
  }

  validation = skillMatrixSchema.safeParse(parsed);
  if (!validation.success)
    throw new Error("AI failed to generate valid JSON after retry");

  return validation.data;
}
