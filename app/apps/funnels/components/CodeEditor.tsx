"use client";

import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = "html",
  height = "600px",
}: CodeEditorProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
