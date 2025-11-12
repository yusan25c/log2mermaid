import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

interface LogInputProps {
  value: string;
  onChange: (value: string) => void;
  matchedLineIndices?: Set<number>;
}

export const LogInput = ({ value, onChange, matchedLineIndices = new Set() }: LogInputProps) => {
  const highlightedContent = useMemo(() => {
    const lines = value.split("\n");
    return lines.map((line, index) => {
      const isMatched = matchedLineIndices.has(index);
      return (
        <div
          key={index}
          className={`px-3 py-1 ${isMatched ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
        >
          {line || "\u00A0"}
        </div>
      );
    });
  }, [value, matchedLineIndices]);

  return (
    <div className="flex flex-col h-full">
      <Label htmlFor="log-input" className="mb-2 text-sm font-medium">
        Log Content
        {matchedLineIndices.size > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({matchedLineIndices.size} matched lines)
          </span>
        )}
      </Label>
      <div className="flex-1 relative overflow-hidden rounded-md border border-input bg-background">
        <div className="absolute inset-0 overflow-auto font-mono text-sm">
          {highlightedContent}
        </div>
        <Textarea
          id="log-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nov  2 12:34:56 : [12345678.012345] Component1 func:1245 hogehoge val 1&#10;Nov  2 12:34:56 : [12345678.012345] Component2 func:1245 str=abc val 1"
          className="flex-1 h-full font-mono text-sm resize-none bg-transparent border-0 relative z-10 text-transparent caret-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-primary/20"
        />
      </div>
    </div>
  );
};
