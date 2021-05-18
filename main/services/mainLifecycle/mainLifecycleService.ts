import { ILogService } from "../log/log";
import { IStateService } from "../state/state";
import { ILifecycleMainService } from "./mainLifecycle";
import { injectable, inject } from "tsyringe";
import { Emitter } from "../../common/event";
import { BaseService } from "../base/service";
import { app } from "electron";
import { containerConfig as config } from "../base/token";


@injectable()
export class MainLifecycleService extends BaseService implements ILifecycleMainService {

    // Use to test same instance
    luckynumber: number = Math.random();
    out() {
        console.log("lucky: " + this.luckynumber);
    }

    wasRestarted: boolean = false;
    quitRequested: boolean = false;

    // Main lifecycle
    readonly _onBeforeShutdown = this._register(new Emitter<void>());
    readonly onBeforeShutdown = this._onBeforeShutdown.event;

    readonly _onWillShutdown = this._register(new Emitter<void>());
    readonly onWillShutdown = this._onWillShutdown.event;

    readonly _onWillLoadWindow = this._register(new Emitter<void>());
    readonly onWillLoadWindow = this._onWillLoadWindow.event;

    readonly _onBeforeUnloadWindow = this._register(new Emitter<void>());
    readonly onBeforeUnloadWindow = this._onBeforeUnloadWindow.event;

    readonly _onBeforeCloseWindow = this._register(new Emitter<void>());
    readonly onBeforeCloseWindow = this._onBeforeCloseWindow.event;

    readonly _onError = this._register(new Emitter<Error>());
    readonly onError = this._onError.event;

    constructor(
        @inject(config.TOKEN_ILOG.value) private readonly logService: ILogService,
        @inject(config.TOKEN_ISTATE.value) private readonly stateService: IStateService
    ) {
        super();
        this.registerListener();
        this.logService.info("MainLifecycleService#Constructor");
    }
    
    setup() {
        this.logService.info("MainLifecycleService#Setup");
    }

    serviceDidInit() {
        this.logService.info("MainLifecycleService#Init");
    }

    serviceDidReady() {
        this.logService.info("MainLifecycleService#Ready");
    }
    dispose() {
        console.log("MainLifecycleService#dispose");	
        super.dispose();
    }

    registerListener() {
        const beforeQuite = () => {
            this.logService.trace('Lifecycle#onBeforeShutdown.fire()');
            this._onBeforeShutdown.fire();
        }

        app.addListener('before-quit', beforeQuite);

        app.once('will-quit', e => {
            this.logService.trace('Lifecycle#app.on(will-quit)');

            app.removeListener('before-quit', beforeQuite);
            this.dispose();
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