import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

interface LogInputProps {
  value: string;
  onChange: (value: string) => void;
  matchedLineIndices?: Set<number>;
}

export const LogInput = ({ value, onChange, matchedLineIndices = new Set() }: LogInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain' || file.name.endsWith('.log') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onChange(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onChange(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="log-input" className="text-sm font-medium">
          Log Content
          {matchedLineIndices.size > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({matchedLineIndices.size} matched lines)
            </span>
          )}
        </Label>
        <label htmlFor="log-file-input">
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Log
            </span>
          </Button>
        </label>
        <input
          id="log-file-input"
          type="file"
          accept=".log,.txt,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <div 
        className={`flex-1 relative overflow-hidden rounded-md border transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-input"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-20 pointer-events-none">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop log file here</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 overflow-auto font-mono text-sm whitespace-pre-wrap break-words">
          {highlightedContent}
        </div>
        <Textarea
          id="log-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nov  2 12:34:56 : [12345678.012345] Component1 func:1245 hogehoge val 1&#10;Nov  2 12:34:56 : [12345678.012345] Component2 func:1245 str=abc val 1"
          className="flex-1 h-full font-mono text-sm resize-none bg-transparent border-0 relative z-10 text-transparent caret-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-primary/20 whitespace-pre-wrap break-words"
        />
      </div>
    </div>
  );
};
