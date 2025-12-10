import Papa from "papaparse";
import safeRegex from "safe-regex";
import { logger } from "./logger";

interface CsvRule {
  title: string;
  match: string;
  src: string;
  dst: string;
  kind?: string;
}

type InteractionKind = 'message' | 'note';

const escapeText = (text: string): string => {
  return text
    .replace(/"/g, "'")
    .replace(/`/g, "'")
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const adjustTitle = (title: string, lineIndex: number): string => {
  return `${escapeText(title)}<br/>L:${lineIndex + 1}`;
};

const needsAlias = (name: string): boolean => {
  return !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
};

const isRegexSafe = (pattern: string): boolean => {
  try {
    // Check if pattern is safe and not too long
    return safeRegex(pattern) && pattern.length < 200;
  } catch {
    return false;
  }
};

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
        if (!isRegexSafe(rule.match)) {
          logger.error(`Unsafe regex pattern rejected: ${rule.match}`);
          return;
        }
        const regex = new RegExp(rule.match);
        if (regex.test(line)) {
          matchedIndices.add(index);
        }
      } catch (error) {
        logger.error(`Invalid regex pattern: ${rule.match}`, error);
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
  const interactions: Array<{ src: string; dst: string; title: string; lineIndex: number; line: string; kind: InteractionKind }> = [];

  logLines.forEach((line, index) => {
    rules.forEach((rule) => {
      try {
        if (!isRegexSafe(rule.match)) {
          logger.error(`Unsafe regex pattern rejected: ${rule.match}`);
          return;
        }
        const regex = new RegExp(rule.match);
        if (regex.test(line)) {
          const kindRaw = (rule.kind || 'message').trim().toLowerCase();
          const kind: InteractionKind = kindRaw === 'note' ? 'note' : 'message';
          
          // For message type, dst is required; for note type, dst is optional
          if (kind === 'message' && !rule.dst) {
            return;
          }
          
          interactions.push({
            src: rule.src,
            dst: rule.dst || '',
            title: rule.title,
            lineIndex: index,
            line: line,
            kind: kind,
          });
        }
      } catch (error) {
        logger.error(`Invalid regex pattern: ${rule.match}`, error);
      }
    });
  });

  if (interactions.length === 0) {
    return "";
  }

  // Collect participants in order
  const participantsOrdered: string[] = [];
  const participantsSeen = new Set<string>();
  
  interactions.forEach((interaction) => {
    if (interaction.src && !participantsSeen.has(interaction.src)) {
      participantsOrdered.push(interaction.src);
      participantsSeen.add(interaction.src);
    }
    if (interaction.dst && !participantsSeen.has(interaction.dst)) {
      participantsOrdered.push(interaction.dst);
      participantsSeen.add(interaction.dst);
    }
  });

  // Create aliases for participants with invalid identifiers
  const alias: Record<string, string> = {};
  let counter = 1;
  participantsOrdered.forEach((p) => {
    if (needsAlias(p)) {
      alias[p] = `P${counter}`;
      counter++;
    } else {
      alias[p] = p;
    }
  });

  let mermaidCode = "sequenceDiagram\n";
  mermaidCode += "    autonumber\n";
  
  participantsOrdered.forEach((participant) => {
    const a = alias[participant];
    if (a === participant) {
      mermaidCode += `    participant ${a}\n`;
    } else {
      mermaidCode += `    participant ${a} as "${escapeText(participant)}"\n`;
    }
  });

  interactions.forEach((interaction) => {
    const s = alias[interaction.src];
    const d = interaction.dst ? alias[interaction.dst] : null;
    
    if (interaction.kind === 'note') {
      // Note: display as Note over participants
      if (d) {
        mermaidCode += `    Note over ${s},${d}: ${adjustTitle(interaction.title, interaction.lineIndex)}\n`;
      } else {
        mermaidCode += `    Note over ${s}: ${adjustTitle(interaction.title, interaction.lineIndex)}\n`;
      }
    } else {
      // Message: display as arrow
      const dest = d || s; // fallback to self if no dst
      mermaidCode += `    ${s} ->> ${dest}: ${adjustTitle(interaction.title, interaction.lineIndex)}\n`;
    }
  });

  return mermaidCode;
};
