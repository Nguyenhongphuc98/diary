import { ILifeCycle } from "../base/lifecycle";
import { BaseService } from "../base/service";
import { IConfiguration } from "./configuration";


// ex enable crash reporter
// language, http.proxyAuthorization, enable background update, 
export class ConfigurationService extends BaseService implements IConfiguration {

    constructor() {
        super();
    }

    setup() {
		console.log('ConfigurationService#Setup');	
	}

    getValue(section: string): any {
        console.log("get value");
        return section;
    }

    updateValue(key: string, value: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}