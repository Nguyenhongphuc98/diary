import { Event } from "../../common/event";
import { LifeCycleState, NoInputHandle } from "../types";


// export class LifeCycle {

//     // Listener queue
//     private readonly _onInit: NoInputHandle[];

//     private readonly _onReady: NoInputHandle[];

//     private readonly _onPause: NoInputHandle[];

//     private readonly _onResume: NoInputHandle[];

//     private readonly _onDeInit: NoInputHandle[];

//     constructor() {
//         this._onInit = [];
//         this._onReady = [];
//         this._onPause = [];
//         this._onResume = [];
//         this._onDeInit = [];
//     }

//     onInit(): void {
//         this._invokeListener(this._onInit);
//     }

//     onReady(): void {
//         this._invokeListener(this._onReady);
//     }

//     onPause(): void {
//         this._invokeListener(this._onPause);
//     }

//     onResume(): void {
//         this._invokeListener(this._onResume);
//     }

//     onDeInit(): void {
//         this._invokeListener(this._onDeInit);
//     }

//     addEventListener(event: LifeCycleState, handler: NoInputHandle): void {
//         switch (event) {
//             case 'init':
//                 this._onInit.push(handler);
//                 break;
//             case 'ready':
//                 this._onReady.push(handler);
//                 break;
//             case 'pause':
//                 this._onPause.push(handler);
//                 break;
//             case 'resume':
//                 this._onResume.push(handler);
//                 break;
//             case 'deinit':
//                 this._onDeInit.push(handler);
//                 break;
//         }
//     }

//     removeEventListener(event: LifeCycleState, handler: NoInputHandle): void {
//         let index: number;
//         let handlers: NoInputHandle[];

//         switch (event) {
//             case 'init':
//                 handlers = this._onInit;
//                 break;
//             case 'ready':
//                 handlers = this._onReady;
//                 break;
//             case 'pause':
//                 handlers = this._onPause;
//                 break;
//             case 'resume':
//                 handlers = this._onResume;
//                 break;
//             case 'deinit':
//                 handlers = this._onDeInit;
//                 break;
//         }

//         index = handlers.indexOf(handler, 0);
//         if (index > -1) {
//             handlers.splice(index, 1);
//         }
//     }

//     private _invokeListener(handlers: NoInputHandle[]): void {
//         for (const handle of handlers) {
//             handle();
//         }
//     }
// }

export interface ILifeCycle {

    onInit: Event<void>;

    onReady: Event<void>;

    onPause: Event<void>;

    onResume: Event<void>;

    onDeInit: Event<void>;
}