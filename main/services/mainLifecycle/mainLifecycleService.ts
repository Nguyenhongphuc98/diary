import { LifeCycle } from "../lifecycle";
import { ILogService } from "../log/log";
import { IStateService } from "../state/state";
import { NoInputHandle } from "../types";
import { ILifecycleMainService } from "./mainLifecycle";
import { injectable, inject } from "tsyringe";

@injectable()
export class MainLifecycleService extends LifeCycle implements ILifecycleMainService {

    wasRestarted: boolean = false;
    quitRequested: boolean = false;

    constructor(
		@inject("ILogService") private readonly logService: ILogService,
		@inject("IStateService") private readonly stateService: IStateService
	) {
		super();
        this.onInit();
	}

    onInit() {
		console.log('MainLifecycleService did init');
		super.onInit();
	}
    
    onBeforeShutdown(): void {};
    onWillShutdown(): void {};
    onWillLoadWindow(): void {};
    onBeforeUnloadWindow(): void {};
    onBeforeCloseWindow(): void {};
    onError(err: Error): void {
        console.log(err);
    };
    
    reload(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    unload(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    relaunch(options?: { addArgs?: string[] | undefined; removeArgs?: string[] | undefined; }): void {
        throw new Error("Method not implemented.");
    }

    quit(fromUpdate?: boolean): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    kill(code?: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
}