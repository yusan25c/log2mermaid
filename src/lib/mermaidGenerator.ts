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

export const getMatchedLineIndices = (
  csvContent: string,
  logContent: string
): Set<number> => {
  const rules = parseCsv(csvContent);
  if (rules.length === 0 || !logContent.trim()) {
    return new Set();
  }

  const logLines = logContent.split("\n");
  const matchedIndices = new Set<number>();

  logLines.forEach((line, index) => {
    if (!line.trim()) return;
    rules.forEach((rule) => {
      try {
        const regex = new RegExp(rule.match);
        if (regex.test(line)) {
          matchedIndices.add(index);
        }
      } catch (error) {
        console.error(`Invalid regex pattern: ${rule.match}`, error);
      }
    });
  });

  return matchedIndices;
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
  const interactions: Array<{ src: string; dst: string; title: string, lineIndex: number, line: string }> = [];

  logLines.forEach((line, index) => {
    rules.forEach((rule) => {
      try {
        const regex = new RegExp(rule.match);
        if (regex.test(line)) {
          interactions.push({
            src: rule.src,
            dst: rule.dst,
            title: rule.title,
            lineIndex: index,
            line: line,
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
    mermaidCode += `    note over ${interaction.src},${interaction.dst}: L${interaction.lineIndex + 1} : ${interaction.line}\n`;
  });

  return mermaidCode;
};
