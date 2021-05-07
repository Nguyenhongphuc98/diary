import { URI } from "../../common/uri";

export interface IEnvironmentService {

	// --- user roaming data
	userRoamingDataHome: URI;
	settingsResource: URI;
	keybindingsResource: URI;
	keyboardLayoutResource: URI;

	// --- data paths
	untitledWorkspacesHome: URI;
	globalStorageHome: URI;
	workspaceStorageHome: URI;

	// --- settings sync
	userDataSyncHome: URI;
	userDataSyncLogResource: URI;
	sync: 'on' | 'off' | undefined;

	// --- logging
	logsPath: string;
	logLevel?: string;
	verbose: boolean;
	isBuilt: boolean;

    // --- data paths
	appRoot: string;
	userHome: URI;
	appSettingsHome: URI;
	tmpDir: URI;
	userDataPath: string;
	machineSettingsResource: URI;
	installSourcePath: string;
}
