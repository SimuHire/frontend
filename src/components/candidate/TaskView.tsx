"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import CodeEditor from "@/components/candidate/CodeEditor";

type TaskType = "design" | "code" | "debug" | "handoff" | "documentation" | string;

type Task = {
  id: number;
  dayIndex: number;
  type: TaskType;
  title: string;
  description: string;
};

function isCodeTask(t: Task) {
  return t.type === "code" || t.type === "debug";
}

function loadDraft(storageKey: string) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return { text: "", code: "// start here\n" };
    const parsed = JSON.parse(raw) as { text?: string; code?: string };
    return {
      text: parsed.text ?? "",
      code: parsed.code ?? "// start here\n",
    };
  } catch {
    return { text: "", code: "// start here\n" };
  }
}

function TaskViewInner({
  task,
  onSubmit,
  submitting,
}: {
  task: Task;
  submitting: boolean;
  onSubmit: (payload: { contentText?: string; codeBlob?: string }) => Promise<void> | void;
}) {
  const storageKey = useMemo(() => `simuhire:candidate_task_draft:${task.id}`, [task.id]);

  const initial = useMemo(() => loadDraft(storageKey), [storageKey]);

  const [text, setText] = useState<string>(() => initial.text);
  const [code, setCode] = useState<string>(() => initial.code);

  const codeTask = isCodeTask(task);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ text, code }));
    } catch {
    }
  }, [storageKey, text, code]);

  async function handleSubmit() {
    if (codeTask) {
      await onSubmit({ codeBlob: code });
    } else {
      await onSubmit({ contentText: text });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 border rounded-md bg-white">
      <div className="text-sm text-gray-500">
        Day {task.dayIndex} • {String(task.type)}
      </div>
      <div className="text-2xl font-bold mt-1">{task.title}</div>

      <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{task.description}</div>

      <div className="mt-6">
        {codeTask ? (
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

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit & Continue"}
        </Button>
      </div>
    </div>
  );
}

export default function TaskView(props: {
  task: Task;
  submitting: boolean;
  onSubmit: (payload: { contentText?: string; codeBlob?: string }) => Promise<void> | void;
}) {
  return <TaskViewInner key={props.task.id} {...props} />;
}
