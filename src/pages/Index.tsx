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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/80 px-8 py-6 shadow-sm">
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Log to Mermaid Sequence Diagram
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Generate beautiful sequence diagrams from log files automatically</p>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 p-6 overflow-hidden">
        <div className="flex flex-col gap-6 overflow-hidden animate-slide-up">
          <div className="flex-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300">
            <CsvInput value={csvContent} onChange={setCsvContent} />
          </div>
          <div className="flex-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300">
            <LogInput value={logContent} onChange={setLogContent} matchedLineIndices={matchedLineIndices} />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <MermaidPreview mermaidCode={mermaidCode} />
        </div>
      </main>
    </div>
  );
};

export default Index;
