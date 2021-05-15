
import "reflect-metadata";
import { container, instanceCachingFactory } from "tsyringe";
import { StateService } from "./services/state/stateService";
import { ConfigurationService } from "./services/config/configurationService";
import { EnviromentService } from "./services/enviroment/enviromentService";
import { MainLifecycleService } from "./services/mainLifecycle/mainLifecycleService";
import { FileLogService } from "./services/log/fileLogService";
import { RequestService } from "./services/request/requestService";
import { FileService } from "./services/file/fileService";
import { MainApplication } from "./main-process/appMain";
import { LogLevel } from "./services/log/log";
import { URI } from "./common/uri";
import { IDownload } from "./services/download/download";
import { ServiceManager } from "./services/base/serviceManager";

// Begin init and setup services ===================================================
// ==================================================================================

const sm = new ServiceManager();

sm.register(
	"IFileService", {
	useClass: FileService
});

sm.register(
	"IStateService", {
	useClass: StateService
});

sm.register("ILogService",
	{
		useFactory: c => {
			const fileService = c.resolve(FileService);
			const uri = new URI('uri')
			return new FileLogService('internal log', uri, LogLevel.Info, fileService);
		}
	},
	FileLogService
);

sm.register(
	"IConfiguration", {
	useClass: ConfigurationService
});

sm.register(
	"IEnvironmentService", {
	useClass: EnviromentService
});

sm.register(
	"IRequestService", {
	useClass: RequestService
});

sm.register(
	"ILifecycleMainService", {
	useClass: MainLifecycleService
});

sm.register("IDownload", {
	useFactory: instanceCachingFactory<Promise<IDownload>>(async c => {

		const DownloadService = (await import("./services/download/downloadService")).DownloadService;
		const requestService = sm.resolve(RequestService);
		const fileService = sm.resolve(FileService);

		return new DownloadService(requestService, fileService);
	})
},

);
// End init and setup services ===================================================

const appCode = container.resolve(MainApplication);
appCode.startup();