import { Event } from "../../common/event";

export interface ILifecycleMainService {
	out():void;

	readonly wasRestarted: boolean;

	/**
	 * Will be true if the program was requested to quit.
	 */
	readonly quitRequested: boolean;

	readonly onBeforeShutdown: Event<void>;

	readonly onWillShutdown: Event<void>;

	readonly onWillLoadWindow: Event<void>;

	readonly onBeforeUnloadWindow: Event<void>;

	readonly onBeforeCloseWindow: Event<void>;

	readonly onError: Event<Error>;

	reload(): Promise<void>;

	unload(): Promise<boolean>;

	relaunch(options?: { addArgs?: string[], removeArgs?: string[] }): void;

	quit(fromUpdate?: boolean): Promise<boolean>;

	kill(code?: number): Promise<void>;
}