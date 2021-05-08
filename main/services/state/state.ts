import { IService } from "../base/service";

export interface IStateService extends IService {
	
	getItem<T>(key: string, defaultValue: T): T;
	getItem<T>(key: string, defaultValue?: T): T | undefined;

	setItem(key: string, data?: object | string | number | boolean | undefined | null): void;

	removeItem(key: string): void;
}
