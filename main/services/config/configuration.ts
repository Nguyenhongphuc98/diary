import { LifeCycle } from "../lifecycle";


export interface IConfiguration {
    
    getValue<T>(section: string): any;

	updateValue(key: string, value: any): Promise<void>;
}