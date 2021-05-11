import { Event } from "../../common/event";

export interface ILifeCycle {

    // Use to hook block code
    onInit: Event<void>;
    onReady: Event<void>;
    onPause: Event<void>;
    onResume: Event<void>;
    onDeInit: Event<void>;

    // use to observer when event fired
    didInit?(e: void): any;
    didReady?(e: void): any;
    didPause?(e: void): any;
    didResume?(e: void): any;
    diddeInit?(e: void): any;
}