import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface LogInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const LogInput = ({ value, onChange }: LogInputProps) => {
  return (
    <div className="flex flex-col h-full">
      <Label htmlFor="log-input" className="mb-2 text-sm font-medium">
        Log Content
      </Label>
      <Textarea
        id="log-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nov  2 12:34:56 : [12345678.012345] Component1 func:1245 hogehoge val 1&#10;Nov  2 12:34:56 : [12345678.012345] Component2 func:1245 str=abc val 1"
        className="flex-1 font-mono text-sm resize-none bg-card border-muted"
      />
    </div>
  );
};
