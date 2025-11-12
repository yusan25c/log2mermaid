import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CsvInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CsvInput = ({ value, onChange }: CsvInputProps) => {
  return (
    <div className="flex flex-col h-full">
      <Label htmlFor="csv-input" className="mb-2 text-sm font-medium">
        CSV Mapping Rules
      </Label>
      <Textarea
        id="csv-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="title,match,src,dst&#10;access,Component1 func:,Client,Web Server&#10;request,Component2 func:.* str=abc,Web Server,API Server"
        className="flex-1 font-mono text-sm resize-none bg-card border-muted"
      />
    </div>
  );
};
