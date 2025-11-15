import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Download, GripVertical, Copy, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";
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
  const [columnWidths, setColumnWidths] = useState([80, 150, 80, 80, 50]);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    let filtered = parsedRows;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = parsedRows.filter(row => 
        row.title.toLowerCase().includes(query) ||
        row.match.toLowerCase().includes(query) ||
        row.src.toLowerCase().includes(query) ||
        row.dst.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (!sortField || !sortDirection) return filtered;
    
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    return sorted;
  }, [parsedRows, sortField, sortDirection, searchQuery]);

  const updateCell = (rowIndex: number, field: keyof CsvRow, newValue: string) => {
    const updatedRows = [...parsedRows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: newValue };
    convertToCsv(updatedRows);
  };

  const addRow = () => {
    const newRow: CsvRow = { title: "", match: "", src: "", dst: "" };
    convertToCsv([...parsedRows, newRow]);
  };

  // Always ensure there's an empty row at the end for adding new entries
  const displayRows = useMemo(() => {
    const hasEmptyRow = rows.length === 0 || rows.some(row => 
      !row.title && !row.match && !row.src && !row.dst
    );
    
    if (!hasEmptyRow && !searchQuery) {
      return [...rows, { title: "", match: "", src: "", dst: "" }];
    }
    
    return rows;
  }, [rows, searchQuery]);

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
      <div className="flex items-center gap-2 mb-3">
        <Label className="text-sm font-semibold text-foreground">Mapping</Label>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <Button onClick={downloadCsv} variant="outline" size="sm" className="h-8 w-8 p-0" title="Download CSV">
          <Download className="h-4 w-4" />
        </Button>
        <label htmlFor="csv-file-input">
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <span className="cursor-pointer" title="Upload CSV">
              <Upload className="h-4 w-4" />
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
        
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { label: 'Title', field: 'title' as keyof CsvRow },
                { label: 'Match Pattern', field: 'match' as keyof CsvRow },
                { label: 'Source', field: 'src' as keyof CsvRow },
                { label: 'Destination', field: 'dst' as keyof CsvRow },
                { label: '', field: null }
              ].map((header, idx) => (
                <TableHead 
                  key={idx}
                  className={header.field ? 'cursor-pointer hover:bg-accent/20' : ''}
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
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-16 text-sm">
                  No matching rules found. Add a new rule or adjust your search.
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, index) => {
                const originalIndex = parsedRows.findIndex(r => r === row);
                return (
                  <TableRow key={index}>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newValue = e.currentTarget.textContent || "";
                        if (originalIndex >= 0) {
                          updateCell(originalIndex, "title", newValue);
                        }
                      }}
                      className="font-mono cursor-text"
                    >
                      {row.title}
                    </TableCell>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newValue = e.currentTarget.textContent || "";
                        if (originalIndex >= 0) {
                          updateCell(originalIndex, "match", newValue);
                        }
                      }}
                      className="font-mono cursor-text"
                    >
                      {row.match}
                    </TableCell>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newValue = e.currentTarget.textContent || "";
                        if (originalIndex >= 0) {
                          updateCell(originalIndex, "src", newValue);
                        }
                      }}
                      className="font-mono cursor-text"
                    >
                      {row.src}
                    </TableCell>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newValue = e.currentTarget.textContent || "";
                        if (originalIndex >= 0) {
                          updateCell(originalIndex, "dst", newValue);
                        }
                      }}
                      className="font-mono cursor-text"
                    >
                      {row.dst}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => originalIndex >= 0 && deleteRow(originalIndex)}
                        disabled={originalIndex < 0}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
