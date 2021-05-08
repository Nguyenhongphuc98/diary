import { Disposable } from "../../common/disposable";
import { Emitter } from "../../common/event";
import { ILifeCycle } from "./lifecycle";

export interface IService {

    setup?: Function;
}

export class BaseService extends Disposable implements ILifeCycle {

    protected readonly _onInit = this._register(new Emitter<void>());
	readonly onInit = this._onInit.event;
    
    protected readonly _onReady = this._register(new Emitter<void>());
	readonly onReady = this._onReady.event;

    protected readonly _onPause = this._register(new Emitter<void>());
	readonly onPause = this._onPause.event;

    protected readonly _onResume = this._register(new Emitter<void>());
	readonly onResume = this._onResume.event;
    
    protected readonly _onDeInit = this._register(new Emitter<void>());
	readonly onDeInit = this._onDeInit.event;
}