import { LifeCycle } from "../lifecycle";
import { IConfiguration } from "./configuration";


// ex enable crash reporter
// language, http.proxyAuthorization, enable background update, 
export class ConfigurationService extends LifeCycle implements IConfiguration {

    constructor() {
        super();
        this.onInit();
    }

    onInit() {
		console.log('ConfigurationService did init');	
		super.onInit();
	}

    getValue(section: string): any {
        console.log("get value");
        return section;
    }

    updateValue(key: string, value: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}