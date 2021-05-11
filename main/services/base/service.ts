import { Disposable } from "../../common/disposable";
import { Emitter } from "../../common/event";
import { NoInputHandle } from "../types";
import { ILifeCycle } from "./lifecycle";

export interface IService {

    setup?(): void;
}

export abstract class BaseService extends Disposable implements ILifeCycle, IService {

    public readonly _onInit = this._register(new Emitter<void>());
	readonly onInit = this._onInit.event;
    
    public readonly _onReady = this._register(new Emitter<void>());
	readonly onReady = this._onReady.event;

    protected readonly _onPause = this._register(new Emitter<void>());
	readonly onPause = this._onPause.event;

    protected readonly _onResume = this._register(new Emitter<void>());
	readonly onResume = this._onResume.event;
    
    protected readonly _onDeInit = this._register(new Emitter<void>());
	readonly onDeInit = this._onDeInit.event;

    setup?(): void;

    didInit?(e: void): any;
    didReady?(e: void): any;
}