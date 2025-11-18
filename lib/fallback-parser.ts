import { SkillMatrix } from "./schemas/skill-matrix.schema";

const SKILLS = {
  frontend: ["react", "vue", "angular", "next.js", "typescript", "html", "css"],
  backend: ["node.js", "express", "python", "django", "java", "go"],
  devops: ["docker", "kubernetes", "aws", "terraform", "ci/cd"],
  web3: [
    "solidity",
    "ethereum",
    "evm",
    "smart contract",
    "web3.js",
    "ethers.js",
    "wagmi",
    "viem",
    "merkle",
    "staking",
  ],
};

const SENIORITY = {
  junior: ["junior", "jr", "entry"],
  mid: ["mid", "middle"],
  senior: ["senior", "sr", "experienced"],
  lead: ["lead", "architect", "manager"],
};

export function fallbackParser(jobDescription: string): SkillMatrix {
  const lower = jobDescription.toLowerCase();

  let seniority: SkillMatrix["seniority"] = "unknown";
  let seniorityLabel = "";
  for (const [level, keywords] of Object.entries(SENIORITY)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      seniority = level as SkillMatrix["seniority"];
      seniorityLabel = level.charAt(0).toUpperCase() + level.slice(1);
      break;
    }
  }

  const roleKeywords = [
    "developer",
    "engineer",
    "full-stack",
    "frontend",
    "backend",
  ];
  let roleLabel = "Software Engineer";
  for (const kw of roleKeywords) {
    if (lower.includes(kw)) {
      roleLabel = kw
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      break;
    }
  }
  const title = `${
    seniorityLabel ? seniorityLabel + " " : ""
  }${roleLabel} vacancy`;

  const skills: SkillMatrix["skills"] = {
    frontend: [],
    backend: [],
    devops: [],
    web3: [],
    other: [],
  };
  for (const [category, list] of Object.entries(SKILLS)) {
    list.forEach((skill) => {
      if (lower.includes(skill))
        skills[category as keyof typeof SKILLS].push(skill);
    });
  }

  const mustHaveMatch = jobDescription.match(
    /requirements.*?[:\n]\s*([\s\S]*?)(?=\n\n|what|nice|$)/i
  );
  const mustHave = mustHaveMatch
    ? mustHaveMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter((l) => l.length > 5)
    : ["Relevant technical experience required"];

  const niceToHaveMatch = jobDescription.match(
    /nice to have.*?[:\n]\s*([\s\S]*?)(?=\n\n|$)/i
  );
  const niceToHave = niceToHaveMatch
    ? niceToHaveMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter((l) => l.length > 5)
    : ["Additional skills are beneficial"];

  let salary: SkillMatrix["salary"] | undefined;
  const salaryMatch = jobDescription.match(
    /(\$|€|£|PLN)\s*(\d+)(?:\s*(?:-|\u2013)\s*(\d+))?/i
  );
  if (salaryMatch) {
    const currencyMap: Record<string, "USD" | "EUR" | "GBP" | "PLN"> = {
      $: "USD",
      "€": "EUR",
      "£": "GBP",
      PLN: "PLN",
    };
    const currency = currencyMap[salaryMatch[1]] || "USD";
    const min = parseInt(salaryMatch[2]);
    const max = salaryMatch[3] ? parseInt(salaryMatch[3]) : undefined;
    salary = { currency, min, max };
  }

  const totalSkills = Object.values(skills).flat();
  let summary = `${title}`;
  if (totalSkills.length) {
    const skillsPreview = totalSkills.slice(0, 10).join(", ");
    summary += ` requiring skills: ${skillsPreview}.`;
  }
  if (salary) {
    summary += ` Salary: ${salary.currency} ${salary.min}${
      salary.max ? `-${salary.max}` : ""
    }.`;
  }
  summary = summary.trim().split(/\s+/).slice(0, 60).join(" ");

  return { title, seniority, skills, mustHave, niceToHave, salary, summary };
}
