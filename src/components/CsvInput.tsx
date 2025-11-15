import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";

interface CsvInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface CsvRow {
  title: string;
  match: string;
  src: string;
  dst: string;
}

export const CsvInput = ({ value, onChange }: CsvInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const rows = useMemo(() => {
    if (!value.trim()) return [];
    const result = Papa.parse<CsvRow>(value, {
      header: true,
      skipEmptyLines: true,
    });
    return result.data;
  }, [value]);

  const updateCell = (rowIndex: number, field: keyof CsvRow, newValue: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: newValue };
    convertToCsv(updatedRows);
  };

  const addRow = () => {
    const newRow: CsvRow = { title: "", match: "", src: "", dst: "" };
    convertToCsv([...rows, newRow]);
  };

  const deleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    convertToCsv(updatedRows);
  };

  const convertToCsv = (data: CsvRow[]) => {
    const csv = Papa.unparse(data, {
      columns: ["title", "match", "src", "dst"],
    });
    onChange(csv);
  };

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
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
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

  const downloadCsv = () => {
    const blob = new Blob([value], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapping-rules.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "CSV file downloaded successfully",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">CSV Mapping Rules</Label>
        <div className="flex gap-2">
          <Button onClick={downloadCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <label htmlFor="csv-file-input">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </span>
            </Button>
          </label>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={addRow} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
        </div>
      </div>
      <div 
        className={`flex-1 overflow-auto border rounded-md relative transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-10 pointer-events-none">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop CSV file here</p>
            </div>
          </div>
        )}
        <div className="w-full">
          <div className="grid grid-cols-[120px_200px_120px_120px_50px] border-b border-border bg-muted/50">
            <div className="px-3 py-2 text-xs font-medium border-r border-border">Title</div>
            <div className="px-3 py-2 text-xs font-medium border-r border-border">Match Pattern</div>
            <div className="px-3 py-2 text-xs font-medium border-r border-border">Source</div>
            <div className="px-3 py-2 text-xs font-medium border-r border-border">Destination</div>
            <div className="px-3 py-2 text-xs font-medium"></div>
          </div>
          {rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No rules defined. Click "Add Row" to create one.
            </div>
          ) : (
            rows.map((row, index) => (
              <div 
                key={index} 
                className="grid grid-cols-[120px_200px_120px_120px_50px] border-b border-border hover:bg-muted/30 transition-colors"
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(index, "title", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border focus:outline-none focus:bg-primary/5 cursor-text min-h-[28px]"
                >
                  {row.title}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(index, "match", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border focus:outline-none focus:bg-primary/5 cursor-text min-h-[28px]"
                >
                  {row.match}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(index, "src", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border focus:outline-none focus:bg-primary/5 cursor-text min-h-[28px]"
                >
                  {row.src}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(index, "dst", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border focus:outline-none focus:bg-primary/5 cursor-text min-h-[28px]"
                >
                  {row.dst}
                </div>
                <div className="flex items-center justify-center px-1 py-2">
                  <Button
                    onClick={() => deleteRow(index)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
