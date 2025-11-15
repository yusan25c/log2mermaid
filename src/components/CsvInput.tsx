import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Download, GripVertical, Copy, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
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

type SortField = keyof CsvRow | null;
type SortDirection = 'asc' | 'desc' | null;

export const CsvInput = ({ value, onChange }: CsvInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [columnWidths, setColumnWidths] = useState([180, 280, 150, 150, 90]);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const { toast } = useToast();
  
  const parsedRows = useMemo(() => {
    if (!value.trim()) return [];
    const result = Papa.parse<CsvRow>(value, {
      header: true,
      skipEmptyLines: true,
    });
    return result.data;
  }, [value]);

  const rows = useMemo(() => {
    if (!sortField || !sortDirection) return parsedRows;
    
    const sorted = [...parsedRows].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    return sorted;
  }, [parsedRows, sortField, sortDirection]);

  const updateCell = (rowIndex: number, field: keyof CsvRow, newValue: string) => {
    const updatedRows = [...parsedRows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: newValue };
    convertToCsv(updatedRows);
  };

  const addRow = () => {
    const newRow: CsvRow = { title: "", match: "", src: "", dst: "" };
    convertToCsv([...parsedRows, newRow]);
  };

  const deleteRow = (rowIndex: number) => {
    const updatedRows = parsedRows.filter((_, index) => index !== rowIndex);
    convertToCsv(updatedRows);
  };

  const duplicateRow = (rowIndex: number) => {
    const rowToDuplicate = parsedRows[rowIndex];
    const duplicatedRow = { ...rowToDuplicate };
    const updatedRows = [...parsedRows];
    updatedRows.splice(rowIndex + 1, 0, duplicatedRow);
    convertToCsv(updatedRows);
    toast({
      title: "Row duplicated",
      description: "The row has been duplicated successfully",
    });
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

  const handleResizeStart = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingIndex(index);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[index];
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (resizingIndex !== null) {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(80, resizeStartWidth.current + diff);
      const newWidths = [...columnWidths];
      newWidths[resizingIndex] = newWidth;
      setColumnWidths(newWidths);
    }
  };

  const handleResizeEnd = () => {
    setResizingIndex(null);
  };

  useEffect(() => {
    if (resizingIndex !== null) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingIndex, columnWidths]);

  const handleSort = (field: keyof CsvRow) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
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
      <div className="flex items-center justify-between mb-4">
        <Label className="text-base font-semibold text-foreground">CSV Mapping Rules</Label>
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
        className={`flex-1 overflow-auto rounded-lg relative transition-all duration-300 ${
          isDragging ? "ring-2 ring-primary bg-primary/5" : "border border-border bg-background"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-10 pointer-events-none rounded-lg">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop CSV file here</p>
            </div>
          </div>
        )}
        <div className="w-full min-w-max">
          <div 
            className="flex sticky top-0 z-10 bg-muted backdrop-blur-sm border-b border-border"
            style={{ 
              gridTemplateColumns: columnWidths.map(w => `${w}px`).join(' ')
            }}
          >
            {[
              { label: 'Title', field: 'title' as keyof CsvRow },
              { label: 'Match Pattern', field: 'match' as keyof CsvRow },
              { label: 'Source', field: 'src' as keyof CsvRow },
              { label: 'Destination', field: 'dst' as keyof CsvRow },
              { label: '', field: null }
            ].map((header, idx) => (
              <div 
                key={idx}
                className={`relative flex items-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-r border-border/30 last:border-r-0 ${
                  header.field ? 'cursor-pointer hover:bg-accent/30 transition-colors' : ''
                }`}
                style={{ width: columnWidths[idx] }}
                onClick={() => header.field && handleSort(header.field)}
              >
                <span className="flex items-center gap-1.5">
                  {header.label}
                  {header.field && sortField === header.field && (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    )
                  )}
                  {header.field && sortField !== header.field && (
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                  )}
                </span>
                {idx < 4 && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors group"
                    onMouseDown={(e) => handleResizeStart(idx, e)}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <p>No rules defined. Click "Add Row" to create one.</p>
            </div>
          ) : (
            rows.map((row, index) => {
              const originalIndex = parsedRows.findIndex(r => 
                r.title === row.title && r.match === row.match && r.src === row.src && r.dst === row.dst
              );
              return (
              <div 
                key={index} 
                className={`flex group hover:bg-accent/50 transition-all duration-150 border-b border-border/50 ${
                  index % 2 === 0 ? 'bg-muted/20' : 'bg-background'
                }`}
                style={{ 
                  gridTemplateColumns: columnWidths.map(w => `${w}px`).join(' ')
                }}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(originalIndex, "title", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border/20 focus:outline-none focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 cursor-text transition-all min-h-[32px] flex items-center"
                  style={{ width: columnWidths[0] }}
                >
                  {row.title}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(originalIndex, "match", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border/20 focus:outline-none focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 cursor-text transition-all min-h-[32px] flex items-center"
                  style={{ width: columnWidths[1] }}
                >
                  {row.match}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(originalIndex, "src", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border/20 focus:outline-none focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 cursor-text transition-all min-h-[32px] flex items-center"
                  style={{ width: columnWidths[2] }}
                >
                  {row.src}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCell(originalIndex, "dst", e.currentTarget.textContent || "")}
                  className="px-3 py-2 text-xs font-mono border-r border-border/20 focus:outline-none focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 cursor-text transition-all min-h-[32px] flex items-center"
                  style={{ width: columnWidths[3] }}
                >
                  {row.dst}
                </div>
                <div className="flex items-center justify-center gap-1 px-2 py-2" style={{ width: columnWidths[4] }}>
                  <Button
                    onClick={() => duplicateRow(originalIndex)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
                    title="Duplicate row"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => deleteRow(originalIndex)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    title="Delete row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
};
