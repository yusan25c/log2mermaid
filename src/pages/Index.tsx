import { useState, useMemo } from "react";
import { CsvInput } from "@/components/CsvInput";
import { LogInput } from "@/components/LogInput";
import { MermaidPreview } from "@/components/MermaidPreview";
import { generateMermaidCode, getMatchedLineIndices } from "@/lib/mermaidGenerator";
import { FileText } from "lucide-react";

const DEFAULT_CSV = `title,match,src,dst
access,Component1 func:,Client,Web Server
request,Component2 func:.* str=abc,Web Server,API Server
notify,Component3 func:.* str=abc,API Server,Web Server`;

const DEFAULT_LOG = `Nov  2 12:34:56 : [12345678.012345] hogehoge function exec
Nov  2 12:34:56 : [12345678.012345] Component1 func:1245 hogehoge val 1
Nov  2 12:34:56 : [12345678.012345] hogehoge2 func exec
Nov  2 12:34:56 : [12345678.012345] Component2 func:1245 str=abc val 1
Nov  2 12:34:56 : [12345678.012345] Component2 func:1245 str=def val 2
Nov  2 12:34:56 : [12345678.012345] hogehoge function ret: 0
Nov  2 12:34:56 : [12345678.012345] Component3 str=abc val 1`;

const Index = () => {
  const [csvContent, setCsvContent] = useState(DEFAULT_CSV);
  const [logContent, setLogContent] = useState(DEFAULT_LOG);

  const mermaidCode = useMemo(() => {
    return generateMermaidCode(csvContent, logContent);
  }, [csvContent, logContent]);

  const matchedLineIndices = useMemo(() => {
    return getMatchedLineIndices(csvContent, logContent);
  }, [csvContent, logContent]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Log to Mermaid Sequence Diagram</h1>
            <p className="text-sm text-muted-foreground">Generate sequence diagrams from log files automatically</p>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 p-4 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-hidden">
            <CsvInput value={csvContent} onChange={setCsvContent} />
          </div>
          <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-hidden">
            <LogInput value={logContent} onChange={setLogContent} matchedLineIndices={matchedLineIndices} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 overflow-hidden">
          <MermaidPreview mermaidCode={mermaidCode} />
        </div>
      </main>
    </div>
  );
};

export default Index;
