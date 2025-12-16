"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import CodeEditor from "@/components/candidate/CodeEditor";
import { clearCodeDraft, loadCodeDraft, saveCodeDraft } from "@/lib/codeDrafts";

type TaskType = "design" | "code" | "debug" | "handoff" | "documentation" | string;

type Task = {
  id: number;
  dayIndex: number;
  type: TaskType;
  title: string;
  description: string;
};

type SubmitPayload = { contentText?: string; codeBlob?: string };

type SubmitResponse = {
  submissionId: number;
  taskId: number;
  candidateSessionId: number;
  submittedAt: string;
  progress: { completed: number; total: number };
  isComplete: boolean;
};

type SubmitStatus = "idle" | "submitting" | "submitted";

function isCodeTask(t: Task) {
  return t.type === "code" || t.type === "debug";
}

function isTextTask(t: Task) {
  return t.type === "design" || t.type === "documentation" || t.type === "handoff";
}

function textDraftKey(taskId: number) {
  return `simuhire:candidate:textDraft:${String(taskId)}`;
}

function loadTextDraft(taskId: number): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(textDraftKey(taskId)) ?? "";
  } catch {
    return "";
  }
}

function saveTextDraft(taskId: number, text: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(textDraftKey(taskId), text);
  } catch {
  }
}

function clearTextDraft(taskId: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(textDraftKey(taskId));
  } catch {
  }
}

function isSubmitResponse(x: unknown): x is SubmitResponse {
  if (typeof x !== "object" || x === null) return false;
  const rec = x as Record<string, unknown>;
  const progress = rec["progress"];
  if (typeof rec["submissionId"] !== "number") return false;
  if (typeof rec["taskId"] !== "number") return false;
  if (typeof rec["candidateSessionId"] !== "number") return false;
  if (typeof rec["submittedAt"] !== "string") return false;
  if (typeof rec["isComplete"] !== "boolean") return false;
  if (typeof progress !== "object" || progress === null) return false;
  const p = progress as Record<string, unknown>;
  return typeof p["completed"] === "number" && typeof p["total"] === "number";
}

function TaskViewInner({
  task,
  candidateSessionId,
  onSubmit,
  submitting,
  submitError,
}: {
  task: Task;
  candidateSessionId: number;
  submitting: boolean;
  submitError?: string | null;
  onSubmit: (payload: SubmitPayload) => Promise<SubmitResponse | void> | SubmitResponse | void;
}) {
  const codeTask = isCodeTask(task);
  const textTask = isTextTask(task);

  const [text, setText] = useState<string>(() => loadTextDraft(task.id));
  const [code, setCode] = useState<string>(() => {
    const draft = loadCodeDraft(candidateSessionId, task.id);
    return draft ?? "// start here\n";
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [lastProgress, setLastProgress] = useState<{ completed: number; total: number } | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const submittedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalError(null);
    setLastProgress(null);
    setSubmitStatus(submitting ? "submitting" : "idle");

    if (textTask) {
      setText(loadTextDraft(task.id));
    }
    if (codeTask) {
      const draft = loadCodeDraft(candidateSessionId, task.id);
      setCode(draft ?? "// start here\n");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (submittedTimerRef.current) window.clearTimeout(submittedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (submitting) setSubmitStatus("submitting");
  }, [submitting]);

  useEffect(() => {
    if (submitting) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(() => {
      if (textTask) saveTextDraft(task.id, text);
      if (codeTask) saveCodeDraft(candidateSessionId, task.id, code);
    }, 350);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [candidateSessionId, code, codeTask, submitting, task.id, text, textTask]);

  function saveDraftNow() {
    if (!textTask) return;
    saveTextDraft(task.id, text);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 1500);
  }

  function clearDraftOnSuccess() {
    if (textTask) clearTextDraft(task.id);
    if (codeTask) clearCodeDraft(candidateSessionId, task.id);
  }

  async function handleSubmit() {
    if (submitStatus !== "idle" || submitting) return;

    if (textTask) {
      const trimmed = text.trim();
      if (!trimmed) {
        setLocalError("Please enter an answer before submitting.");
        return;
      }

      setLocalError(null);
      setSubmitStatus("submitting");

      try {
        const resp = await onSubmit({ contentText: trimmed });

        if (isSubmitResponse(resp)) {
          setLastProgress(resp.progress);
          setSubmitStatus("submitted");
          clearDraftOnSuccess();

          submittedTimerRef.current = window.setTimeout(() => {
            setSubmitStatus("idle");
            setLastProgress(null);
          }, 900);
        } else {
          clearDraftOnSuccess();
          setSubmitStatus("idle");
        }
      } catch {
        setSubmitStatus("idle");
      }

      return;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setLocalError("Please write some code before submitting.");
      return;
    }

    setLocalError(null);
    setSubmitStatus("submitting");

    try {
      const resp = await onSubmit({ codeBlob: code });

      if (isSubmitResponse(resp)) {
        setLastProgress(resp.progress);
        setSubmitStatus("submitted");
        clearDraftOnSuccess();

        submittedTimerRef.current = window.setTimeout(() => {
          setSubmitStatus("idle");
          setLastProgress(null);
        }, 900);
      } else {
        clearDraftOnSuccess();
        setSubmitStatus("idle");
      }
    } catch {
      setSubmitStatus("idle");
    }
  }

  const errorToShow = localError ?? submitError ?? null;

  return (
    <div className="max-w-3xl mx-auto p-6 border rounded-md bg-white">
      <div className="text-sm text-gray-500">
        Day {task.dayIndex} • {String(task.type)}
      </div>
      <div className="text-2xl font-bold mt-1">{task.title}</div>

      <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{task.description}</div>

      <div className="mt-6">
        {codeTask ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              File: <span className="font-medium text-gray-700">index.ts</span>
            </div>
            <CodeEditor value={code} onChange={setCode} language="typescript" />
            <div className="text-xs text-gray-500">
              Draft auto-saves locally while you type (refresh-safe until you submit).
            </div>
          </div>
        ) : (
          <>
            <textarea
              className="w-full min-h-[260px] border rounded-md p-3 text-sm leading-6"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your response here…"
              disabled={submitting || submitStatus === "submitted"}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{text.length.toLocaleString()} characters</span>
              {savedAt ? <span>Draft saved</span> : null}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600 min-h-[20px]">
        {submitStatus === "submitting" ? (
          <span>Submitting…</span>
        ) : submitStatus === "submitted" ? (
          <span>
            Submitted ✓{" "}
            {lastProgress ? `Progress: ${lastProgress.completed}/${lastProgress.total}` : null}
          </span>
        ) : null}
      </div>

      {errorToShow ? (
        <div className="mt-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorToShow}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        {textTask ? (
          <button
            type="button"
            onClick={saveDraftNow}
            disabled={submitting || submitStatus !== "idle"}
            className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Save draft
          </button>
        ) : (
          <div />
        )}

        <Button onClick={handleSubmit} disabled={submitting || submitStatus !== "idle"}>
          {submitStatus === "submitting"
            ? "Submitting…"
            : submitStatus === "submitted"
              ? "Submitted ✓"
              : "Submit & Continue"}
        </Button>
      </div>
    </div>
  );
}

export default function TaskView(props: {
  task: Task;
  candidateSessionId: number;
  submitting: boolean;
  submitError?: string | null;
  onSubmit: (payload: SubmitPayload) => Promise<SubmitResponse | void> | SubmitResponse | void;
}) {
  return <TaskViewInner key={props.task.id} {...props} />;
}
