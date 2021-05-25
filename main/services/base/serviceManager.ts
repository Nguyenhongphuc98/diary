/*---------------------------------------------------------------------------------------------
 *  Manage lifecycle of services.
 *--------------------------------------------------------------------------------------------*/

import "reflect-metadata";
import { BaseService, IService } from "./service";
import { app } from "electron";
import { LinkedList } from "../../common/linkedList";
import { ClassProvider, container, DependencyContainer, FactoryProvider, InjectionToken, isClassProvider, isFactoryProvider } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { DelayedConstructor } from "tsyringe/dist/typings/lazy-helpers";
import { castPromise, likePromise } from "../../common/utils";
import { LifeCyclePhase } from "./lifecycle";
import { CustomPromiseToken, CustomToken, STLikeService } from "./token";
import { CachePromise } from "../types";
import { FileService } from "../file/fileService";


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


type CtorToken<T> = constructor<T> | DelayedConstructor<T>;

// Token in general, acceptable to register in service manager
export type ZAToken<T, T1 extends CachePromise<T>>  = InjectionToken<T> | CustomPromiseToken<T1, T> | CustomToken<T>

export interface IServiceManager {
    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: FactoryProvider<T1 | T>): DependencyContainer;
    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: ClassProvider<T>);


    resolve<T, T1 extends CachePromise<T>>(token: CustomPromiseToken<T1, T>): T | undefined;
    resolve<T>(token: InjectionToken<T> | CustomToken<T>): T;

    resolveAsync<T, T1 extends CachePromise<T>>(token: InjectionToken<T> | CustomPromiseToken<T1, T>): T1;
    resolveAsync<T>(token: InjectionToken<T> | CustomToken<T>): Promise<T>;
}

export class ServiceManager implements IServiceManager {

    // One type of service may have multi instances
    private services: LinkedList<BaseService>;

    // Cache the way create instance
    private registry: Map<any, any>;

    // Prevent add event to class did register
    private registered: Set<InjectionToken<IService>>;

    // Avoid register even on app too much time
    private eventQueue: ((e: Electron.Event) => void)[];
    private timeout: NodeJS.Timeout | undefined;

    constructor() {
        this.services = new LinkedList();
        // this.fulfilledServices = new Map();
        this.registry = new Map();
        this.registered = new Set();
        this.eventQueue = [];
    }

    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: FactoryProvider<T | T1> | ClassProvider<T>): any {

        const resolvedToken = this._processToken(token);

        if (isFactoryProvider(provider)) {

            return container.register(resolvedToken, {
                useFactory: (c => {
                    const instance = provider.useFactory(c);

                    // This maybe is a async factory, will return a promise
                    // If it behave like promise, we assume it is type of promise <duck typing>
                    const promise = castPromise(instance);

                    if (promise) {
                        promise.then(value => {
                            // Cache value, so don't need to await for nex time use this service
                            promise.value = value;

                            // After fulfill, we know how to create instance without await promise
                            // Cache factory return ctor/value let we create/return instance directly in next time call resolve this token.
                            this.registry.set(resolvedToken, value);

                            this._afterResolve(value as unknown as BaseService);
                        });
                    } else {
                        this._afterResolve(instance as unknown as BaseService);
                    }

                    return instance;
                })
            })
        } else {

            container.register(resolvedToken, {
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
    resolve<T, T1 extends CachePromise<T>>(token:  ZAToken<T, T1>): T | undefined {
        const resolvedToken = this._processToken(token);

        // This service can be promise
        // one case can get it is it has been fulfill before
        if (token instanceof CustomPromiseToken) {

            const value = this.registry.get(resolvedToken);
            if (value && typeof value.constructor === "function") {
                // Use cached constructor
                return container.resolve(value.constructor);   
            } else {
                // Factory return value, rarely but possible
                return value; // value | undefine
            }
        } else {

            let service = container.resolve(resolvedToken);
            // Resolve by Cto mean no use register before
            if (typeof token === "function") {
                const s = service as unknown as BaseService;

                this._afterResolve(s);
            }
            return service as T;
        }
    }

    // We can pass sync or async token, but anyway the result will be a promise
    // Never apply for Cto token
    resolveAsync<T, T1 extends CachePromise<T>>(token:  ZAToken<T, T1>): Promise<T> | T1 {
        const service = container.resolve(this._processToken(token));

        // Resolve by Cto mean no use register before
        if (typeof token === "function") {
            throw new Error("Constructor can' resolve as async!!!");
        }
        return Promise.resolve(service);
    }

    private _processToken<T, T1 extends CachePromise<T>>(token:  ZAToken<T, T1>): InjectionToken<T> {
        const t = token instanceof CustomToken || token instanceof CustomPromiseToken ? token.value : token;
        return t;
    }

    // Never use after resolution because it load code for object type
    // Will not get benefit of dynamic load register.
    private _afterResolve(service: BaseService) {
        // Don't need process for obj did process before (singleton)
        if (service.phase > LifeCyclePhase.init) {
            return;
        }
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
        service.phase = LifeCyclePhase.init;

        if (service.serviceDidReady) {
            service.onReady(service.serviceDidReady);
        }

        service.phase = LifeCyclePhase.setup;
        if (service.setup) {
            service.setup();
        }

        if (service.asyncSetup) {
            await service.asyncSetup();
        }

        service._onReady.fire();
        service.phase = LifeCyclePhase.ready;
    }

    private _triggerEventFromMainProcess(service: BaseService) {
        this.eventQueue.push(e => {

            service._onDepose.fire();
            service.dispose();
            service.phase = LifeCyclePhase.dispose;

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
export function getServiceManager(): IServiceManager {
    return serviceManager;
}