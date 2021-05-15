/*---------------------------------------------------------------------------------------------
 *  Manage lifecycle of services.
 *--------------------------------------------------------------------------------------------*/

import "reflect-metadata";
import { BaseService, IService } from "./service";
import { app } from "electron";
import { LinkedList } from "../../common/linkedList";
import { ClassProvider, container, DependencyContainer, FactoryProvider, InjectionToken, isClassProvider, isFactoryProvider } from "tsyringe";
import instance from "tsyringe/dist/typings/dependency-container";
import { constructor, RegistrationOptions } from "tsyringe/dist/typings/types";
import { DelayedConstructor } from "tsyringe/dist/typings/lazy-helpers";
import { isConstructorToken } from "tsyringe/dist/typings/providers/injection-token";
import { FileLogService } from "../log/fileLogService";
// import { ILifeCycle } from "./lifecycle";
// import { StateService } from "../state/stateService";
// import { FileService } from "../file/fileService";
// import {Ctor} from "../types"
// import {
//     container,
//     ClassProvider,
//     InjectionToken,
//     predicateAwareClassFactory,
//     instanceCachingFactory
// } from "tsyringe";



// export function AutoManage<T extends { new(...args: any[]): {} }>(): any {

//     return (target: T): Ctor<T> => {
//         // Save a reference to the original constructor
//         const Original = target;

//         // the new constructor behaviour
//         let decoratedConstructor: any = function (...args: any[]): void {
//             console.log("Before construction:", Original);
//             Original.apply(this, args);
//             console.log("After construction");
//         };

//         // Copy prototype so intanceof operator still works
//         decoratedConstructor.prototype = Original.prototype;
//         // Copy static members too
//         Object.keys(Original).forEach((name: string) => { decoratedConstructor[name] = (<any>Original)[name]; });

//         // Return new constructor (will override original)
//         return decoratedConstructor;
//     };
// }

// export function AutoManage() {
//     return function (target: any) {

//         const original = target;

//         var newCtor: any = function (...args) {
//             console.log('AutoManage: before class constructor', original.name);
//             // let instance = new original(args);
//             let instance = original.apply(this, args)
//             console.log('AutoManage: after class constructor', original.name);
//             return instance;
//         }

//         // copy prototype so intanceof operator still works
//         newCtor.prototype = original.prototype;

//         // return new constructor (will override original)
//         return newCtor;
//     };
// }

// export function AutoManage(attr: any) {
//     return function _AutoManage<T extends {new(...args: any[]): {}}>(constr: T){
//       return class extends constr {
//         constructor(...args: any[]) {
//           super(...args)
//           console.log('Did something after the original constructor!')
//           console.log('Here is my attribute!', attr.attrName)
//         }
//       }
//     }
//   }


// const t = (
//     target: Object,
//     propertyKey: string,
//     descriptor: PropertyDescriptor
// ) => {
//     const originalMethod = descriptor.value;

//     descriptor.value = function (...args) {

//         const result = originalMethod.apply(this, args);

//         console.log(`Execution time: milliseconds`);
//         return result;
//     };

//     return descriptor;
// };



// export class ServiceManager implements IServiceManager {

//     private colections: Map<string, BaseService>;

//     private registered: Set<string>;

//     constructor() {
//         this.colections = new Map();
//         this.registered = new Set();
//     }

//     register<T>(token: InjectionToken<T>, provider: ClassProvider<T>, options?: RegistrationOptions) {
//         const tokenStr = token as string;
//         this._observerInit(tokenStr, provider);


//         // Each time resolve will create new instance
//         container.register(
//             token as string, {
//             useFactory: instanceCachingFactory(c => {

//                 return c.resolve(provider.useClass);
//             })
//         });
//     }

//     private _observerInit<T>(token: string, provider: ClassProvider<T>) {
//         if (!this.registered.has(token)) {
//             this.registered.add(token);

//             container.afterResolution(
//                 provider.useClass,
//                 (_t, result) => {

//                     console.log("did resolve");


//                     {
//                         // const service = (result as unknown as BaseService);

//                         // if (service) {
//                         //     if (service.didInit) {
//                         //         service.onInit(service.didInit);
//                         //     }

//                         //     // fire to make sure all block code hooked can be trigger.
//                         //     service._onInit.fire();

//                         //     if (service.setup) {
//                         //         service.setup();

//                         //         if (service.didReady) {
//                         //             service.onReady(service.didReady);
//                         //         }

//                         //         // fire to make sure all block code hooked can be trigger.
//                         //         service._onReady.fire();
//                         //     }
//                         // }
//                     }
//                 },
//                 {
//                     frequency: "Always"
//                 }
//             );
//         }
//     }
// }

type CtorToken<T> = constructor<T> | DelayedConstructor<T>;

export interface IServiceManager {
    register<T>(token: InjectionToken<T>, provider: ClassProvider<T>);
    register<T>(token: InjectionToken<T>, provider: FactoryProvider<T>, instanceType: CtorToken<T>): DependencyContainer;

    resolve<T>(token: InjectionToken<T>): T
}

export class ServiceManager implements IServiceManager {

    // One type of service may have multi instances
    private services: LinkedList<BaseService>;

    // Prevent add event to class did register
    private registered: Set<InjectionToken<IService>>;

    // Avoid register even on app too much time
    private eventQueue: ((e: Electron.Event) => void)[];
    private timeout: NodeJS.Timeout | undefined;

    constructor() {
        this.services = new LinkedList();
        this.registered = new Set();
        this.eventQueue = [];
    }

    register<T>(token: InjectionToken<T>, provider: FactoryProvider<T> | ClassProvider<T>): any {
        
        if (isFactoryProvider(provider)) {
           
            return container.register(token, {
                useFactory: (c => {
                    const instance =  provider.useFactory(c);

                    // This maybe is a async factory, will return a promise
                    if (instance instanceof Promise) {
                        instance.then(value => {
                            this._afterResolve(value as unknown as BaseService);
                        });
                    } else {
                        this._afterResolve(instance as unknown as BaseService);
                    }

                    return instance;
                })
            })
        } else {

            container.register(token, {
                useFactory: (c => {
                    const instance = c.resolve(provider.useClass);
                    this._afterResolve(instance as unknown as BaseService);
                    return instance;
                })
            })
        }
    }

    // Sometime, we resolve an instance without register before (ex by Ctor)
    // in that case, we need add trigger for resolve operation
    resolve<T>(token: InjectionToken<T>): T {
        const service = container.resolve(token);
    
        // Resolve by Cto mean no use register before
        if (typeof token === "function") {
            this._afterResolve(service as unknown as BaseService);
        }
        return service;
    }

    // Trigger lifecycle
    // private _addTrigger<T>(token: InjectionToken<T>, instanceType: CtorToken<T>) {
    //     if (!this.registered.has(token)) {
    //         this.registered.add(token);

    //         container.afterResolution(
    //             instanceType,
    //             (_t, result) => {

    //                 const s = result as unknown as BaseService;
    //                 this._executeFirstPhase(s)
    //                 this._triggerEventFromMainProcess(s);
    //             },
    //             {
    //                 frequency: "Always"
    //             }
    //         );
    //     }
    // }

    private _afterResolve(service: BaseService) {
        this.services.push(service);
        this._executeFirstPhase(service)
        this._triggerEventFromMainProcess(service);
    }

    private async _executeFirstPhase(service: BaseService) {
        if (service.serviceDidInit) {
            service.onInit(service.serviceDidInit);
        }
        // Broadcast for all register known
        service._onInit.fire();

        if (service.serviceDidReady) {
            service.onReady(service.serviceDidReady);
        }

        if (service.setup) {
            service.setup();
        }

        if (service.asyncSetup) {
            await service.asyncSetup();
        }

        // if (service instanceof FileLogService) {
        //     console.log(service);
            
        // }

        service._onReady.fire();
    }

    private _triggerEventFromMainProcess(service: BaseService) {
        this.eventQueue.push(e => {

            if (service.serviceWillDeInit) {
                service.onDeInit(service.serviceWillDeInit);
            }

            service._onDeInit.fire();
            service.dispose();

            this.services.remove(service);
        });

        if (!this.timeout) {
            this.timeout = setTimeout(() => {
                const tempQueue = this.eventQueue;
                this.eventQueue = [];
                this.timeout = undefined;

                app.once('will-quit', e => {
                    tempQueue.forEach(cb => {
                        cb(e);
                    })
                });
            }, 100);
        }
    }
}


const serviceManager = new ServiceManager();
export function getServiceManager() {
    return serviceManager;
}