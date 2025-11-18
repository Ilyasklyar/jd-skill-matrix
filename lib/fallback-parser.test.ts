import { fallbackParser } from "./fallback-parser";

describe("fallbackParser", () => {
  it("parses a simple Job Description", () => {
    const jobDescription = `
      Senior Frontend Developer
      Requirements:
      - React
      - TypeScript
      Nice to have:
      - Next.js
    `;

    const result = fallbackParser(jobDescription);

    expect(result.seniority).toBe("senior");
    expect(result.skills.frontend).toContain("react");
    expect(result.mustHave.length).toBeGreaterThan(0);
    expect(result.niceToHave).toContain("Next.js");
  });
});
