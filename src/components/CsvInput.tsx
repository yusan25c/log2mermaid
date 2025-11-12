import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">CSV Mapping Rules</Label>
        <Button onClick={addRow} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>
      </div>
      <div className="flex-1 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Title</TableHead>
              <TableHead className="w-[200px]">Match Pattern</TableHead>
              <TableHead className="w-[120px]">Source</TableHead>
              <TableHead className="w-[120px]">Destination</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No rules defined. Click "Add Row" to create one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={row.title}
                      onChange={(e) => updateCell(index, "title", e.target.value)}
                      className="h-8 font-mono text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.match}
                      onChange={(e) => updateCell(index, "match", e.target.value)}
                      className="h-8 font-mono text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.src}
                      onChange={(e) => updateCell(index, "src", e.target.value)}
                      className="h-8 font-mono text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.dst}
                      onChange={(e) => updateCell(index, "dst", e.target.value)}
                      className="h-8 font-mono text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => deleteRow(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
