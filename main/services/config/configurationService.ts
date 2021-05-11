import { ILifeCycle } from "../base/lifecycle";
import { BaseService } from "../base/service";
import { IConfiguration } from "./configuration";


// ex enable crash reporter
// language, http.proxyAuthorization, enable background update, 
export class ConfigurationService extends BaseService implements IConfiguration {

    constructor() {
        super();
    }

    didInit() {
        console.log("ConfigurationService#Init");	
    }
	
    didReady() {
        console.log("ConfigurationService#Ready");	
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