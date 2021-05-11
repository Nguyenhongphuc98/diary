
export type NoInputHandle = () => void;

export type LifeCycleState = "init" | "ready" | "pause" | "resume" | "deinit";

export type ErrorHanlder = (Error) => void;

export interface Error {
    name: string;
    message: string;
    stack?: string;
}