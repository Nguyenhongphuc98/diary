
export enum SMLifecycle {
    Transient = 0,
    Singleton = 1,
    ContainerScoped = 2
}

export type SMRegistrationOptions = {
    lifecycle: SMLifecycle;
};

export interface SMRegistryItem {
    instance?: any;
    lifecycle: SMLifecycle;
}

export class SMRegistry {
    private _registry: Map<any, SMRegistryItem> = new Map();
    constructor() {
    }

    get(key: any): SMRegistryItem | undefined {
        return this._registry.get(key);
    }

    getInstance(key: any): any {
        return this._registry.get(key)?.instance;
    }

    set(key: any, value: SMRegistryItem): SMRegistryItem {
        this._registry.set(key, value);
        return value;
    }

    setInstance<T>(key: any, value: T): T {
        const item = this.get(key);
        if (item) {
           item.instance = value;
        } else {
            console.warn("SMRegistryItem not found with key: ", key);
        }
        return value;
    }

    setLifecycle(key: any, value: SMLifecycle) {
        const item = this.get(key);
        if (item) {
           item.lifecycle = value;
        } else {
            console.warn("SMRegistryItem not found with key: ", key);
        }
    }
}