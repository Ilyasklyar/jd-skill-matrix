"use client";

import { JobDescriptionForm } from "@/components/job-description-form";
import { JsonResultPanel } from "@/components/json-result-panel";
import { extractJobDescription } from "@/lib/api/extract-API";
import { jobDescriptionSchema } from "@/lib/schemas/job-description.schema";
import { SkillMatrix } from "@/lib/schemas/skill-matrix.schema";
import { FormEvent, useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SkillMatrix | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError("");
    setResult(null);
  };

  const handleUpdateDescription = (value: string) => {
    setJobDescription(value);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    reset();

    const validated = jobDescriptionSchema.safeParse({
      jobDescription: jobDescription.trim(),
    });

    if (!validated.success) {
      const firstErrorMessage =
        validated.error.issues?.[0]?.message ?? "Invalid input";
      setError(firstErrorMessage);
      setLoading(false);
      return;
    }

    try {
      const data = await extractJobDescription(jobDescription);
      setResult(data);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-12">
      <JobDescriptionForm
        jobDescription={jobDescription}
        error={error}
        loading={loading}
        onChange={handleUpdateDescription}
        onSubmit={handleSubmit}
      />

      {result && <JsonResultPanel result={result} />}
    </main>
  );
}
