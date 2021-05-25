import { BaseService } from "../base/service";
import { IConfiguration } from "./configuration";

// ex enable crash reporter
// language, http.proxyAuthorization, enable background update, 
export class ConfigurationService extends BaseService implements IConfiguration {

    enableCrashReporter: boolean = true;
    language: string = "vi";

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

    dispose() {
        console.log("ConfigurationService#dispose");	
        super.dispose();
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