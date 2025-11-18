"use client";

import { FormEvent } from "react";

interface JobDescriptionFormProps {
  jobDescription: string;
  error: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function JobDescriptionForm({
  jobDescription,
  error,
  loading,
  onChange,
  onSubmit,
}: JobDescriptionFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col w-[600px] items-center mb-8"
    >
      <h1 className="text-2xl font-bold mb-4">Job Description Analyzer</h1>

      <textarea
        value={jobDescription}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter job description here"
        className="w-full h-48 border border-gray-50 rounded-lg p-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#6b7280 #151b23",
        }}
      />

      <p className="text-red-500 text-sm h-8">{error}</p>

      <button
        type="submit"
        className="border border-gray-50 rounded-lg p-2 w-full cursor-pointer hover:bg-gray-50 
        hover:text-black transition-colors duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
}
