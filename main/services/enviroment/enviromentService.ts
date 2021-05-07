import { singleton } from "tsyringe";
import { URI } from "../../common/uri";
import { LifeCycle } from "../lifecycle";
import { IEnvironmentService } from "./enviroment";

@singleton()
export class EnviromentService extends LifeCycle implements IEnvironmentService {

    constructor(){
        super();
        this.onInit();
    }
    
    onInit() {
        console.log('EnviromentService did init');
        super.onInit();
    }

    userRoamingDataHome: URI = new URI("appData");
    settingsResource: URI = new URI("appData");
    keybindingsResource: URI = new URI("appData");
    keyboardLayoutResource: URI = new URI("appData");
    untitledWorkspacesHome: URI = new URI("appData");
    globalStorageHome: URI = new URI("appData");
    workspaceStorageHome: URI = new URI("appData");
    userDataSyncHome: URI = new URI("appData");
    userDataSyncLogResource: URI = new URI("appData");
    sync: "on" | "off" | undefined;
    logsPath: string = "path";
    logLevel?: string | undefined;
    verbose: boolean = false;
    isBuilt: boolean = false;
    appRoot: string = "root";
    userHome: URI = new URI("appData");
    appSettingsHome: URI = new URI("appData");
    tmpDir: URI = new URI("appData");
    userDataPath: string = "dataPath";
    machineSettingsResource: URI = new URI("appData");
    installSourcePath: string = "dataPath";
}