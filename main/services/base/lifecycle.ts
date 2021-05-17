import { Emitter, Event } from "../../common/event";

export interface ILifeCycle {

    // Use to hook block code
    // readonly _onInit: Emitter<void>;
    // readonly _onReady: Emitter<void>;
    // readonly _onPause: Emitter<void>;
    // readonly _onResume: Emitter<void>;
    // readonly _onDeInit: Emitter<void>;

    onInit: Event<void>;
    onReady: Event<void>;
    onPause: Event<void>;
    onResume: Event<void>;
    onDepose: Event<void>;

    // use to observer when event fired
    serviceDidInit?(e: void): any;
    serviceDidReady?(e: void): any;
    serviceWillPause?(e: void): any;
    serviceWillResume?(e: void): any;
}