import { BaseService } from "../base/service";
import { IConfiguration } from "./configuration";

// ex enable crash reporter
// language, http.proxyAuthorization, enable background update, 
export class ConfigurationService extends BaseService implements IConfiguration {

    constructor() {
        super();
        console.log("In ConfigurationService constructor");
    }

    serviceDidInit() {
        console.log("ConfigurationService#Init");	
    }
	
    serviceDidReady() {
        console.log("ConfigurationService#Ready");	
    }

    serviceWillDeInit() {
        console.log("ConfigurationService#Deinit");	
    }

    setup() {
		console.log('ConfigurationService#Setup');	
	}

    getValue(section: string): any {
        console.log("ConfigurationService#GetValue");
        return section;
    }

    updateValue(key: string, value: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}