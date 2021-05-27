/*---------------------------------------------------------------------------------------------
 *  Manage lifecycle of services.
 *--------------------------------------------------------------------------------------------*/

import "reflect-metadata";
import { BaseService, IService } from "./service";
import { app } from "electron";
import { LinkedList } from "../../common/linkedList";
import { ClassProvider, container, DependencyContainer, FactoryProvider, InjectionToken, isClassProvider, isFactoryProvider, isValueProvider, singleton, ValueProvider } from "tsyringe";
import { constructor, Lifecycle, RegistrationOptions } from "tsyringe/dist/typings/types";
import { DelayedConstructor } from "tsyringe/dist/typings/lazy-helpers";
import { castPromise } from "../../common/utils";
import { LifeCyclePhase } from "./lifecycle";
import { CustomPromiseToken, CustomToken } from "./token";
import { CachePromise } from "../types";
import { SMLifecycle, SMRegistrationOptions, SMRegistry } from "./registry";

type CtorToken<T> = constructor<T> | DelayedConstructor<T>;

// Token in general, acceptable to register in service manager
export type ZAToken<T, T1 extends CachePromise<T>> = InjectionToken<T> | CustomPromiseToken<T1, T> | CustomToken<T>
export type ZAProvider<T, T1 extends CachePromise<T>> = FactoryProvider<T | T1> | ClassProvider<T> | ValueProvider<T>;

export interface IServiceManager {
    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: FactoryProvider<T1 | T>): IServiceManager;
    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: ClassProvider<T>, options?: SMRegistrationOptions): IServiceManager;
    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: ValueProvider<T>): IServiceManager;

    resolve<T, T1 extends CachePromise<T>>(token: CustomPromiseToken<T1, T>): T | undefined;
    resolve<T>(token: InjectionToken<T> | CustomToken<T>): T;

    resolveAsync<T, T1 extends CachePromise<T>>(token: InjectionToken<T> | CustomPromiseToken<T1, T>): T1;
    resolveAsync<T>(token: InjectionToken<T> | CustomToken<T>): Promise<T>;
}

export class ServiceManager implements IServiceManager {

    // One type of service may have multi instances
    private services: LinkedList<BaseService>;

    // Cache the way create instance
    private registry: SMRegistry;

    // Prevent add event to class did register
    private registered: Set<InjectionToken<IService>>;

    // Avoid register even on app too much time
    private eventQueue: ((e: Electron.Event) => void)[];
    private timeout: NodeJS.Timeout | undefined;

    constructor() {
        this.services = new LinkedList();
        // this.fulfilledServices = new Map();
        this.registry = new SMRegistry();
        this.registered = new Set();
        this.eventQueue = [];
    }

    register<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>, provider: ZAProvider<T, T1>, options?: SMRegistrationOptions): IServiceManager {
        const resolvedToken = this._processToken(token);

        switch (true) {
            case (isClassProvider(provider)):
                const useclass = (provider as ClassProvider<T>).useClass;
                const opt = options || { lifecycle: SMLifecycle.Transient };
                this.registry.set(resolvedToken, opt);

                container.register(resolvedToken, {
                    useFactory: (c => {
                        let instance;
                        if (opt.lifecycle === SMLifecycle.Singleton || opt.lifecycle === SMLifecycle.ContainerScoped) {
                            instance = this.registry.getInstance(resolvedToken) || this.registry.setInstance(resolvedToken, c.resolve(useclass));
                        } else {
                            instance = c.resolve(useclass);
                            this._afterResolve(instance as unknown as BaseService);
                        }
                        return instance;
                    })
                })
                break;

            case isFactoryProvider(provider):
                container.register(resolvedToken, {
                    useFactory: (c => {
                        const instance = (provider as FactoryProvider<T>).useFactory(c);

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
                break;

            case (isValueProvider(provider)):
                container.register(resolvedToken, {
                    useValue: (provider as ValueProvider<T>).useValue
                })
                break;

            default:
                console.warn("Unknown provider");
                break;
        }

        return this;
    }

    // Resolve service by any token type
    // if it's promise token, we return undefine if it not resolve and fulfill before 
    resolve<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>): ZAToken<T, T1> extends CustomPromiseToken<any, any> ? T | undefined : T {
        const resolvedToken = this._processToken(token);

        // This service can be promise
        // one case can get it is it has been fulfill before
        if (token instanceof CustomPromiseToken) {

            // We don't apply SMLifecycle for async factory
            // So that when come here, it absoutely not cached instance for resolve singleton or container
            const instance = this.registry.getInstance(resolvedToken);
            if (instance && typeof instance.constructor === "function") {
                // Use cached constructor
                return container.resolve(instance.constructor);
            } else {
                // Factory return value, rarely but possible
                return instance; // value | undefine
            }
        } else {

            let service = container.resolve(resolvedToken);
            
            // Resolve by Cto mean no use register before
            // we need add trigger for resolve operation
            if (typeof token === "function") {
                const s = service as unknown as BaseService;

                this._afterResolve(s);
            }
            return service;
        }
    }

    // We can pass sync or async token, but anyway the result will be a promise
    // Never apply for Cto token
    resolveAsync<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>): ZAToken<T, T1> extends CustomPromiseToken<T1, T> ? T1 : Promise<T> {
        const service = container.resolve(this._processToken(token));

        // Resolve by Cto mean no use register before
        if (typeof token === "function") {
            throw new Error("Constructor can' resolve as async!!!");
        }
        return Promise.resolve(service);
    }

    private _processToken<T, T1 extends CachePromise<T>>(token: ZAToken<T, T1>): InjectionToken<T> {
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