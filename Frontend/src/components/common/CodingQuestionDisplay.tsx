import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code2, 
  FileText, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Lightbulb, 
  Sliders, 
  Copy, 
  Check, 
  Terminal as TerminalIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestCaseItem {
  input: string;
  expected_output: string;
  explanation?: string;
  is_hidden?: boolean;
}

export interface CodingQuestionProps {
  title?: string;
  question_text?: string;
  input_format?: string;
  output_format?: string;
  explanation?: string;
  constraints?: string;
  sample_input?: string;
  sample_output?: string;
  test_cases?: TestCaseItem[];
  language?: string;
  difficulty?: string;
  className?: string;
}

/**
 * Smart helper that parses structured sections out of raw markdown/plain-text coding questions.
 * Handles formats like:
 * Question: ...
 * Input Format: ...
 * Output Format: ...
 * Explanation: ...
 * Constraints: ...
 * Expected Input: ... / Sample Input: ...
 * Expected Output: ... / Sample Output: ...
 */
export const parseStructuredCodingQuestion = (question: CodingQuestionProps) => {
  let title = question.title || '';
  let statement = question.question_text || '';
  let inputFormat = question.input_format || '';
  let outputFormat = question.output_format || '';
  let explanation = question.explanation || '';
  let constraints = question.constraints || '';
  let sampleInput = question.sample_input || '';
  let sampleOutput = question.sample_output || '';
  const testCases: TestCaseItem[] = [...(question.test_cases || [])];

  // If question_text contains section markers, parse them out automatically
  if (statement && (!inputFormat || !outputFormat || !sampleInput)) {
    const raw = statement;

    // Title extraction (e.g., "Question 1 — Calculate the Final Bill")
    const titleMatch = raw.match(/^(?:Question\s*\d*\s*[\:\—\-]\s*)?([^\n]+)/i);
    if (titleMatch && !title && titleMatch[1].length < 80) {
      title = titleMatch[1].trim();
    }

    // Input Format
    const inputMatch = raw.match(/Input Format\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Output Format|Explanation|Constraints|Expected Input|Sample Input|Expected Output|Sample Output|$))/i);
    if (inputMatch && !inputFormat) {
      inputFormat = inputMatch[1].trim();
    }

    // Output Format
    const outputMatch = raw.match(/Output Format\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Explanation|Constraints|Expected Input|Sample Input|Expected Output|Sample Output|$))/i);
    if (outputMatch && !outputFormat) {
      outputFormat = outputMatch[1].trim();
    }

    // Explanation
    const expMatch = raw.match(/Explanation\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Constraints|Expected Input|Sample Input|Expected Output|Sample Output|$))/i);
    if (expMatch && !explanation) {
      explanation = expMatch[1].trim();
    }

    // Constraints
    const constrMatch = raw.match(/Constraints\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Expected Input|Sample Input|Expected Output|Sample Output|$))/i);
    if (constrMatch && !constraints) {
      constraints = constrMatch[1].trim();
    }

    // Expected / Sample Input
    const inMatch = raw.match(/(?:Expected Input|Sample Input|Input)\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Expected Output|Sample Output|Output|$))/i);
    if (inMatch && !sampleInput) {
      sampleInput = inMatch[1].trim();
    }

    // Expected / Sample Output
    const outMatch = raw.match(/(?:Expected Output|Sample Output|Output)\s*[\:\-]?\s*\n?([\s\S]*?)(?=\n\s*(?:Question|Input Format|Constraints|$))/i);
    if (outMatch && !sampleOutput) {
      sampleOutput = outMatch[1].trim();
    }

    // Clean main statement if headers were embedded
    const mainStatementMatch = raw.match(/(?:Question\s*[\:\-]\s*)?([\s\S]*?)(?=\n\s*(?:Input Format|Output Format|Explanation|Constraints|Expected Input|Sample Input|$))/i);
    if (mainStatementMatch && mainStatementMatch[1].trim()) {
      statement = mainStatementMatch[1].trim();
      // Remove title from statement if identical
      if (title && statement.startsWith(title)) {
        statement = statement.replace(title, '').trim();
      }
    }
  }

  // If sampleInput and sampleOutput exist but testCases array is empty, populate sample test case
  if (sampleInput && sampleOutput && testCases.length === 0) {
    testCases.push({
      input: sampleInput,
      expected_output: sampleOutput,
      explanation: explanation,
      is_hidden: false
    });
  }

  return {
    title,
    statement,
    inputFormat,
    outputFormat,
    explanation,
    constraints,
    sampleInput,
    sampleOutput,
    testCases
  };
};

export const CodingQuestionDisplay: React.FC<CodingQuestionProps> = (props) => {
  const {
    title,
    statement,
    inputFormat,
    outputFormat,
    explanation,
    constraints,
    sampleInput,
    sampleOutput,
    testCases
  } = parseStructuredCodingQuestion(props);

  const [copiedInput, setCopiedInput] = useState<number | null>(null);
  const [copiedOutput, setCopiedOutput] = useState<number | null>(null);

  const handleCopy = (text: string, type: 'input' | 'output', idx: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(idx);
      setTimeout(() => setCopiedInput(null), 2000);
    } else {
      setCopiedOutput(idx);
      setTimeout(() => setCopiedOutput(null), 2000);
    }
  };

  const visibleTestCases = testCases.filter(tc => !tc.is_hidden);

  return (
    <div className={cn("space-y-6 text-slate-800", props.className)}>
      {/* Question Title & Language Metadata Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {title || 'Coding Challenge'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {props.language && (
            <Badge variant="secondary" className="font-mono text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {props.language}
            </Badge>
          )}
          {props.difficulty && (
            <Badge className={cn(
              "text-xs font-bold capitalize px-2.5 py-0.5",
              props.difficulty === 'easy' && "bg-emerald-500/10 text-emerald-700 border-emerald-300",
              props.difficulty === 'medium' && "bg-amber-500/10 text-amber-700 border-amber-300",
              props.difficulty === 'hard' && "bg-rose-500/10 text-rose-700 border-rose-300"
            )}>
              {props.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Problem Statement */}
      {statement && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <FileText className="h-3.5 w-3.5 text-primary" /> Problem Description
          </div>
          <div className="text-sm sm:text-base leading-relaxed text-slate-700 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm whitespace-pre-wrap">
            {statement}
          </div>
        </div>
      )}

      {/* Input Format & Output Format Grid */}
      {(inputFormat || outputFormat) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFormat && (
            <Card className="border-slate-200/80 shadow-sm bg-slate-50/50 rounded-2xl overflow-hidden">
              <CardHeader className="py-3 px-4 bg-slate-100/70 border-b border-slate-200/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-700">
                  <ArrowDownToLine className="h-4 w-4 text-emerald-600" /> Input Format
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                {inputFormat}
              </CardContent>
            </Card>
          )}

          {outputFormat && (
            <Card className="border-slate-200/80 shadow-sm bg-slate-50/50 rounded-2xl overflow-hidden">
              <CardHeader className="py-3 px-4 bg-slate-100/70 border-b border-slate-200/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-700">
                  <ArrowUpFromLine className="h-4 w-4 text-indigo-600" /> Output Format
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                {outputFormat}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Explanation Section */}
      {explanation && (
        <Card className="border-amber-200/80 bg-amber-50/30 rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-4 bg-amber-100/40 border-b border-amber-200/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-800">
              <Lightbulb className="h-4 w-4 text-amber-600" /> Logic & Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs sm:text-sm leading-relaxed text-amber-950 whitespace-pre-wrap">
            {explanation}
          </CardContent>
        </Card>
      )}

      {/* Constraints Box */}
      {constraints && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Sliders className="h-3.5 w-3.5 text-slate-600" /> Constraints
          </div>
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs sm:text-sm font-mono border border-slate-800 whitespace-pre-wrap">
            {constraints}
          </div>
        </div>
      )}

      {/* Test Cases Section */}
      {(visibleTestCases.length > 0 || sampleInput || sampleOutput) && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
            <TerminalIcon className="h-4 w-4 text-primary" /> Test Cases & Example Values
          </div>

          <div className="space-y-4">
            {visibleTestCases.map((tc, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[11px] font-bold text-slate-600 bg-slate-50">
                    Sample Test Case #{idx + 1}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Expected Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Input</span>
                      {tc.input && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-slate-500 hover:text-slate-900"
                          onClick={() => handleCopy(tc.input, 'input', idx)}
                        >
                          {copiedInput === idx ? (
                            <span className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> Copied</span>
                          ) : (
                            <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</span>
                          )}
                        </Button>
                      )}
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto min-h-[50px]">
                      {tc.input || '(No input)'}
                    </pre>
                  </div>

                  {/* Expected Output */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Expected Output</span>
                      {tc.expected_output && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-slate-500 hover:text-slate-900"
                          onClick={() => handleCopy(tc.expected_output, 'output', idx)}
                        >
                          {copiedOutput === idx ? (
                            <span className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> Copied</span>
                          ) : (
                            <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</span>
                          )}
                        </Button>
                      )}
                    </div>
                    <pre className="p-3 bg-slate-900 text-sky-300 rounded-xl font-mono text-xs overflow-x-auto min-h-[50px]">
                      {tc.expected_output || '(No output)'}
                    </pre>
                  </div>
                </div>

                {tc.explanation && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    💡 <span className="font-semibold">Explanation:</span> {tc.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
