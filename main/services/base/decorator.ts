import { singleton } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

// Help to know that value of async fun (promise) is singletone and behave correctly
export function ZAsingleton<T>(): (target: constructor<T>) => void {
    return function (target: constructor<T>): void {
        singleton()(target);
        target.prototype.singleton = true;
    };
}