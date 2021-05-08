import { ILifeCycle } from "../base/lifecycle";
import { ILogService } from "../log/log";
import { IStateService } from "../state/state";
import { NoInputHandle } from "../types";
import { ILifecycleMainService } from "./mainLifecycle";
import { injectable, inject } from "tsyringe";
import { Disposable } from "../../common/disposable";
import { Emitter } from "../../common/event";
import { BaseService } from "../base/service";
import { app } from "electron";

@injectable()
export class MainLifecycleService extends BaseService implements ILifecycleMainService {

    wasRestarted: boolean = false;
    quitRequested: boolean = false;

    // Main lifecycle
    private readonly _onBeforeShutdown = this._register(new Emitter<void>());
    readonly onBeforeShutdown = this._onBeforeShutdown.event;

    private readonly _onWillShutdown = this._register(new Emitter<void>());
    readonly onWillShutdown = this._onWillShutdown.event;

    private readonly _onWillLoadWindow = this._register(new Emitter<void>());
    readonly onWillLoadWindow = this._onWillLoadWindow.event;

    private readonly _onBeforeUnloadWindow = this._register(new Emitter<void>());
    readonly onBeforeUnloadWindow = this._onBeforeUnloadWindow.event;

    private readonly _onBeforeCloseWindow = this._register(new Emitter<void>());
    readonly onBeforeCloseWindow = this._onBeforeCloseWindow.event;

    private readonly _onError = this._register(new Emitter<Error>());
    readonly onError = this._onError.event;

    constructor(
        @inject("ILogService") private readonly logService: ILogService,
        @inject("IStateService") private readonly stateService: IStateService
    ) {
        super();
        this.registerListener();
    }

    setup() {
        this.logService.info("MainLifecycleService#Setup");
        this._onReady.fire();
    }

    registerListener() {
        const beforeQuite = () => {
            this.logService.trace('Lifecycle#onBeforeShutdown.fire()');
            this._onBeforeShutdown.fire();
        }

        app.addListener('before-quit', beforeQuite);

        app.once('will-quit', e => {
            this.logService.trace('Lifecycle#app.on(will-quit)');

            // Prevent the quit until the shutdown promise was resolved
            //e.preventDefault();

            app.removeListener('before-quit', beforeQuite);
            this.dispose();
            app.quit();
        });
    }

    unload(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    reload(): Promise<void> {
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