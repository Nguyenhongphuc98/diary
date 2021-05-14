import { Event } from "../../common/event";

export interface ILifeCycle {

    // Use to hook block code
    onInit: Event<void>;
    onReady: Event<void>;
    onPause: Event<void>;
    onResume: Event<void>;
    onDeInit: Event<void>;

    // use to observer when event fired
    serviceDidInit?(e: void): any;
    serviceDidReady?(e: void): any;
    serviceWillPause?(e: void): any;
    serviceWillResume?(e: void): any;
    serviceWillDeInit?(e: void): any;
}