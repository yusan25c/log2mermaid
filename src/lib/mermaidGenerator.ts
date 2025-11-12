import Papa from "papaparse";

interface CsvRule {
  title: string;
  match: string;
  src: string;
  dst: string;
}

export const parseCsv = (csvContent: string): CsvRule[] => {
  if (!csvContent.trim()) return [];

  const result = Papa.parse<CsvRule>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
};

export const generateMermaidCode = (
  csvContent: string,
  logContent: string
): string => {
  const rules = parseCsv(csvContent);
  if (rules.length === 0 || !logContent.trim()) {
    return "";
  }

  const logLines = logContent.split("\n").filter((line) => line.trim());
  const interactions: Array<{ src: string; dst: string; title: string }> = [];

  logLines.forEach((line) => {
    rules.forEach((rule) => {
      try {
        const regex = new RegExp(rule.match);
        if (regex.test(line)) {
          interactions.push({
            src: rule.src,
            dst: rule.dst,
            title: rule.title,
          });
        }
      } catch (error) {
        console.error(`Invalid regex pattern: ${rule.match}`, error);
      }
    });
  });

  if (interactions.length === 0) {
    return "";
  }

  const participants = new Set<string>();
  interactions.forEach((interaction) => {
    participants.add(interaction.src);
    participants.add(interaction.dst);
  });

  let mermaidCode = "sequenceDiagram\n";
  
  participants.forEach((participant) => {
    mermaidCode += `    participant ${participant}\n`;
  });

  interactions.forEach((interaction) => {
    mermaidCode += `    ${interaction.src}->>${interaction.dst}: ${interaction.title}\n`;
  });

  return mermaidCode;
};
