import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Play, RotateCcw, Trash2, Terminal as TerminalIcon, Code2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CodePlaygroundProps {
  initialLanguage?: string;
  value: string;
  onChange: (val: string | undefined) => void;
  output?: string;
  onRunCode?: (lang: string, code: string) => Promise<void>;
  isRunning?: boolean;
  readOnly?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)', defaultCode: '// Write your JavaScript code here\nconsole.log("Hello, Academy of Tech Masters!");\n' },
  { id: 'python', name: 'Python 3', defaultCode: '# Write your Python code here\nprint("Hello, Academy of Tech Masters!")\n' },
  { id: 'cpp', name: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Academy of Tech Masters!" << endl;\n    return 0;\n}\n' },
  { id: 'c', name: 'C', defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, Academy of Tech Masters!\\n");\n    return 0;\n}\n' },
  { id: 'java', name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Academy of Tech Masters!");\n    }\n}\n' },
  { id: 'sql', name: 'SQL (SQLite)', defaultCode: '-- Write your SQL queries here\nCREATE TABLE students (id INT, name TEXT);\nINSERT INTO students VALUES (1, "LITAM Student");\nSELECT * FROM students;\n' }
];

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialLanguage = 'javascript',
  value,
  onChange,
  output = '',
  onRunCode,
  isRunning = false,
  readOnly = false,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage.toLowerCase());
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Synchronize language if prop changes
  useEffect(() => {
    if (initialLanguage) {
      const normalized = initialLanguage.toLowerCase();
      if (normalized === 'js') setSelectedLanguage('javascript');
      else if (normalized === 'py' || normalized === 'python3') setSelectedLanguage('python');
      else if (normalized === 'c++') setSelectedLanguage('cpp');
      else setSelectedLanguage(normalized);
    }
  }, [initialLanguage]);

  // Initialize xterm.js Terminal
  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        theme: {
          background: '#090d16',
          foreground: '#e2e8f0',
          cursor: '#38bdf8',
          selectionBackground: '#334155',
          black: '#0f172a',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#facc15',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#38bdf8',
          white: '#f8fafc'
        },
        fontSize: 13,
        fontFamily: 'Consolas, "Fira Code", Monaco, "Courier New", monospace',
        cursorBlink: true,
        scrollback: 1000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      term.writeln('\x1b[1;36m=== LMS Interactive Code Execution Terminal ===\x1b[0m');
      term.writeln('\x1b[90mPowered by Monaco Editor + xterm.js + Piston Engine\x1b[0m');
      term.writeln('');

      const handleResize = () => fitAddon.fit();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
        xtermRef.current = null;
      };
    }
  }, []);

  // Update output in terminal when output prop changes
  useEffect(() => {
    if (xtermRef.current) {
      if (output) {
        xtermRef.current.clear();
        xtermRef.current.writeln('\x1b[1;32m[Execution Completed]\x1b[0m');
        
        // Split by newlines and write
        const lines = output.split('\n');
        lines.forEach((line) => {
          if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
            xtermRef.current?.writeln(`\x1b[1;31m${line}\x1b[0m`);
          } else {
            xtermRef.current?.writeln(line);
          }
        });
      }
    }
  }, [output]);

  const handleClearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[90mTerminal cleared. Ready for execution...\x1b[0m');
    }
  };

  const handleResetCode = () => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage);
    if (langObj) {
      onChange(langObj.defaultCode);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
    if (langObj && (!value || value.trim() === '')) {
      onChange(langObj.defaultCode);
    }
  };

  const currentLangName = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.name || selectedLanguage;

  return (
    <div className="flex flex-col w-full h-[520px] rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">VS Code Editor</span>
          </div>

          <Badge variant="outline" className="text-[10px] bg-cyan-950 text-cyan-400 border-cyan-800/50 font-bold">
            Piston Engine
          </Badge>

          <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={readOnly}>
            <SelectTrigger className="h-8 w-[160px] text-xs bg-slate-800 text-slate-200 border-slate-700 font-mono">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id} className="text-xs font-mono hover:bg-slate-800">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetCode}
            disabled={readOnly}
            title="Reset code template"
            className="h-8 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearTerminal}
            title="Clear terminal"
            className="h-8 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>

          {onRunCode && (
            <Button
              size="sm"
              onClick={() => onRunCode(selectedLanguage, value)}
              disabled={isRunning || !value || !value.trim()}
              className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Run Code
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Split Body: Monaco Editor (Left) & xterm.js Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* Monaco Editor Canvas */}
        <div className="lg:col-span-7 h-full border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={selectedLanguage === 'cpp' || selectedLanguage === 'c' ? 'cpp' : selectedLanguage}
            theme="vs-dark"
            value={value}
            onChange={onChange}
            options={{
              readOnly,
              fontSize: 13,
              fontFamily: '"Fira Code", Consolas, Monaco, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* xterm.js Terminal Console */}
        <div className="lg:col-span-5 h-full bg-[#090d16] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300 font-mono">xterm.js Terminal</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{currentLangName}</span>
          </div>

          <div ref={terminalRef} className="flex-1 w-full p-2 overflow-hidden" />
        </div>
      </div>
    </div>
  );
};
