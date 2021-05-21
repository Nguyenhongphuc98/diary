
export type NoInputHandle = () => void;

export type ErrorHanlder = (Error) => void;

export interface Error {
    name: string;
    message: string;
    stack?: string;
}

export interface InitWindowOptions {
    contentName: string;
    nodeIntegration?: boolean,
    webSecurity?: boolean,
    width?: number;
    height?: number;
}

export type Ctor<T> = new (...args: any[]) => T;

export interface CachePromise<T> extends Promise<T> {
    value?: T | undefined;
}