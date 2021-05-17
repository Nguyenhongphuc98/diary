import { Disposable } from "../../common/disposable";
import { Emitter } from "../../common/event";
import { ILifeCycle } from "./lifecycle";

export interface IService {

    setup?(): void;
    asyncSetup?(): Promise<void>;
}

export abstract class BaseService extends Disposable implements ILifeCycle, IService {

    constructor() {
        super();

        this.serviceDidInit = this.serviceDidInit?.bind(this);
        this.serviceDidReady = this.serviceDidReady?.bind(this);
        this.serviceWillPause = this.serviceWillPause?.bind(this);
        this.serviceWillResume = this.serviceWillResume?.bind(this);
    }

    readonly _onInit = this._register(new Emitter<void>());
	readonly onInit = this._onInit.event;
    
    readonly _onReady = this._register(new Emitter<void>());
	readonly onReady = this._onReady.event;

    readonly _onPause = this._register(new Emitter<void>());
	readonly onPause = this._onPause.event;

    readonly _onResume = this._register(new Emitter<void>());
	readonly onResume = this._onResume.event;
    
    readonly _onDepose = this._register(new Emitter<void>());
	readonly onDepose = this._onDepose.event;

    setup?(): void;
    async asyncSetup?(): Promise<void>;

    serviceDidInit?(e: void): any;
    serviceDidReady?(e: void): any;
    serviceWillPause?(e: void): any;
    serviceWillResume?(e: void): any;
}