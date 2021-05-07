import { ErrorHanlder, NoInputHandle } from "../types";

export interface ILifecycleMainService {

	readonly wasRestarted: boolean;

	/**
	 * Will be true if the program was requested to quit.
	 */
	readonly quitRequested: boolean;

	readonly onBeforeShutdown: NoInputHandle;

	readonly onWillShutdown: NoInputHandle;

	readonly onWillLoadWindow: NoInputHandle;

	readonly onBeforeUnloadWindow: NoInputHandle;

	readonly onBeforeCloseWindow: NoInputHandle;

	readonly onError: (ErrorHanlder);

	reload(): Promise<void>;

	unload(): Promise<boolean>;

	relaunch(options?: { addArgs?: string[], removeArgs?: string[] }): void;

	quit(fromUpdate?: boolean): Promise<boolean>;

	kill(code?: number): Promise<void>;
}