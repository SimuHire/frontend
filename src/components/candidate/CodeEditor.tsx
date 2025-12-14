"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EditorProps } from "@monaco-editor/react";

const MonacoEditor = dynamic<EditorProps>(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function CodeEditor({
  value,
  onChange,
  language = "typescript",
}: {
  value: string;
  onChange: (v: string) => void;
  language?: "javascript" | "typescript";
}) {
  const options = useMemo<NonNullable<EditorProps["options"]>>(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: "on",
      scrollBeyondLastLine: false,
    }),
    []
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <MonacoEditor
        height="420px"
        language={language}
        value={value}
        onChange={(v: string | undefined) => onChange(v ?? "")}
        options={options}
      />
    </div>
  );
}
