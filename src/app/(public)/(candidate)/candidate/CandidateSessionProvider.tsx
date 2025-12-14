"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

type SimulationSummary = {
  title: string;
  role: string;
};

type CandidateBootstrap = {
  candidateSessionId: number;
  status: "not_started" | "in_progress" | "completed" | "expired";
  simulation: SimulationSummary;
};

type TaskType = "design" | "code" | "debug" | "handoff" | "documentation" | string;

type CandidateTask = {
  id: number;
  dayIndex: number;
  type: TaskType;
  title: string;
  description: string;
};

type TaskState = {
  loading: boolean;
  error: string | null;
  isComplete: boolean;
  completedTaskIds: number[];
  currentTask: CandidateTask | null;
};

type CandidateSessionState = {
  token: string | null;
  bootstrap: CandidateBootstrap | null;
  started: boolean;
  taskState: TaskState;
};

type Action =
  | { type: "SET_TOKEN"; token: string }
  | { type: "SET_BOOTSTRAP"; bootstrap: CandidateBootstrap }
  | { type: "SET_STARTED"; started: boolean }
  | { type: "RESET" }
  | { type: "TASK_LOADING" }
  | {
      type: "TASK_LOADED";
      payload: { isComplete: boolean; completedTaskIds: number[]; currentTask: CandidateTask | null };
    }
  | { type: "TASK_ERROR"; error: string }
  | { type: "TASK_CLEAR_ERROR" };

const initialTaskState: TaskState = {
  loading: false,
  error: null,
  isComplete: false,
  completedTaskIds: [],
  currentTask: null,
};

const initialState: CandidateSessionState = {
  token: null,
  bootstrap: null,
  started: false,
  taskState: initialTaskState,
};

function reducer(state: CandidateSessionState, action: Action): CandidateSessionState {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.token };

    case "SET_BOOTSTRAP":
      return { ...state, bootstrap: action.bootstrap };

    case "SET_STARTED":
      return { ...state, started: action.started };

    case "TASK_LOADING":
      return {
        ...state,
        taskState: { ...state.taskState, loading: true, error: null },
      };

    case "TASK_LOADED":
      return {
        ...state,
        taskState: {
          loading: false,
          error: null,
          isComplete: action.payload.isComplete,
          completedTaskIds: action.payload.completedTaskIds,
          currentTask: action.payload.currentTask,
        },
      };

    case "TASK_ERROR":
      return {
        ...state,
        taskState: { ...state.taskState, loading: false, error: action.error },
      };

    case "TASK_CLEAR_ERROR":
      return {
        ...state,
        taskState: { ...state.taskState, error: null },
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

type Ctx = {
  state: CandidateSessionState;
  setToken: (token: string) => void;
  setBootstrap: (b: CandidateBootstrap) => void;
  setStarted: (started: boolean) => void;
  reset: () => void;

  setTaskLoading: () => void;
  setTaskLoaded: (p: { isComplete: boolean; completedTaskIds: number[]; currentTask: CandidateTask | null }) => void;
  setTaskError: (error: string) => void;
  clearTaskError: () => void;
};

const CandidateSessionContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "simuhire:candidate_session_v1";

type PersistedState = {
  token: string | null;
  bootstrap: CandidateBootstrap | null;
  started: boolean;
};

export function CandidateSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (typeof parsed?.token === "string" && parsed.token) {
        dispatch({ type: "SET_TOKEN", token: parsed.token });
      }
      if (parsed?.bootstrap) {
        dispatch({ type: "SET_BOOTSTRAP", bootstrap: parsed.bootstrap as CandidateBootstrap });
      }
      if (typeof parsed?.started === "boolean") {
        dispatch({ type: "SET_STARTED", started: parsed.started });
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      const toPersist: PersistedState = {
        token: state.token,
        bootstrap: state.bootstrap,
        started: state.started,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch {
    }
  }, [state.token, state.bootstrap, state.started]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setToken: (token) => dispatch({ type: "SET_TOKEN", token }),
      setBootstrap: (bootstrap) => dispatch({ type: "SET_BOOTSTRAP", bootstrap }),
      setStarted: (started) => dispatch({ type: "SET_STARTED", started }),
      reset: () => dispatch({ type: "RESET" }),

      setTaskLoading: () => dispatch({ type: "TASK_LOADING" }),
      setTaskLoaded: (payload) => dispatch({ type: "TASK_LOADED", payload }),
      setTaskError: (error) => dispatch({ type: "TASK_ERROR", error }),
      clearTaskError: () => dispatch({ type: "TASK_CLEAR_ERROR" }),
    }),
    [state]
  );

  return <CandidateSessionContext.Provider value={value}>{children}</CandidateSessionContext.Provider>;
}

export function useCandidateSession() {
  const ctx = useContext(CandidateSessionContext);
  if (!ctx) throw new Error("useCandidateSession must be used within CandidateSessionProvider");
  return ctx;
}

export type { CandidateBootstrap, SimulationSummary, CandidateTask, TaskState };
