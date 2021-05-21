import { URI } from "../../common/uri";
import { ZAsingleton } from "../base/decorator";
import { BaseService } from "../base/service";
import { IEnvironmentService } from "./enviroment";

@ZAsingleton()
export class EnviromentService extends BaseService implements IEnvironmentService {

    constructor() {
        super();
        console.log("EnviromentService#Constructor");
    }

    serviceDidInit() {
        console.log("EnviromentService#Init");
    }

    serviceDidReady() {
        console.log("EnviromentService#Ready");
    }

    dispose() {
        console.log("EnviromentService#dispose");
        super.dispose();
    }

    setup() {
        console.log('EnviromentService#Setup');
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