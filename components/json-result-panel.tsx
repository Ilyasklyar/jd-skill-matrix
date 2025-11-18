import { SkillMatrix } from "@/lib/schemas/skill-matrix.schema";
import { useState } from "react";

export function JsonResultPanel({ result }: { result: SkillMatrix }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[600px] rounded-lg p-4 border border-slate-50">
      <p className="text-sm mb-2 ">
        <span className="font-semibold">Summary:</span> {result.summary}
      </p>

      <hr className="border-t border-slate-50 mb-2" />

      <div className="flex justify-between">
        <h3 className="font-medium text-sm mb-2">JSON Output</h3>
        <span
          className="font-medium text-sm mb-2 cursor-pointer"
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy"}
        </span>
      </div>

      <pre
        className="text-slate-300 text-xs overflow-auto max-h-60"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#6b7280 #151b23",
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
