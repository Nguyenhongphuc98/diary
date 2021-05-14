import { Disposable } from "../../common/disposable";
import { Emitter } from "../../common/event";
import { ILifeCycle } from "./lifecycle";
import { getServiceManager } from "./serviceManager";

export interface IService {

    setup?(): void;
    asyncSetup?(): Promise<void>;
}

export abstract class BaseService extends Disposable implements ILifeCycle, IService {

    private manager = getServiceManager();

    constructor() {
        super();
        this.manager.register(this);
    }

    readonly _onInit = this._register(new Emitter<void>());
	readonly onInit = this._onInit.event;
    
    readonly _onReady = this._register(new Emitter<void>());
	readonly onReady = this._onReady.event;

    readonly _onPause = this._register(new Emitter<void>());
	readonly onPause = this._onPause.event;

    readonly _onResume = this._register(new Emitter<void>());
	readonly onResume = this._onResume.event;
    
    readonly _onDeInit = this._register(new Emitter<void>());
	readonly onDeInit = this._onDeInit.event;

    setup?(): void;
    async asyncSetup?(): Promise<void>;

    serviceDidInit?(e: void): any;
    serviceDidReady?(e: void): any;
    serviceWillPause?(e: void): any;
    serviceWillResume?(e: void): any;
    serviceWillDeInit?(e: void): any;
}