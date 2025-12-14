"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import CodeEditor from "./CodeEditor";

type Task = {
  id: number;
  dayIndex: number;
  type: "design" | "code" | "debug" | "handoff" | "documentation";
  title: string;
  prompt: string;
};

export default function TaskView({
  task,
  onSubmit,
  submitting,
}: {
  task: Task;
  submitting: boolean;
  onSubmit: (payload: { contentText?: string; codeBlob?: string }) => void;
}) {
  const [text, setText] = useState("");
  const [code, setCode] = useState("// start here\n");

  const isCode = task.type === "code";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm text-gray-500">Day {task.dayIndex} • {task.type}</div>
      <div className="text-2xl font-bold mt-1">{task.title}</div>
      <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{task.prompt}</div>

      <div className="mt-6">
        {isCode ? (
          <CodeEditor value={code} onChange={setCode} language="typescript" />
        ) : (
          <textarea
            className="w-full min-h-[220px] border rounded-md p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your response here…"
          />
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={() => onSubmit(isCode ? { codeBlob: code } : { contentText: text })}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
