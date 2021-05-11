
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

// Begin init and setup services ===================================================
// ==================================================================================

container.register(
	"IFileService", {
	useClass: FileService
});

container.register(
	"IStateService", {
	useClass: StateService
});

container.register(
	"ILogService", {
	useFactory: instanceCachingFactory<FileLogService>(c => {

		const fileService = c.resolve(FileService);
		const uri = new URI('uri')
		return new FileLogService('internal log', uri, LogLevel.Info, fileService);
	})
});

container.register(
	"IConfiguration", {
	useClass: ConfigurationService
});

container.register(
	"IEnvironmentService", {
	useClass: EnviromentService
});

container.register(
	"IRequestService", {
	useClass: RequestService
});

container.register(
	"ILifecycleMainService", {
	useClass: MainLifecycleService
});


container.register(
	"IDownload", {
	useFactory: instanceCachingFactory<Promise<IDownload>>(async c => {

		const DownloadService = (await import("./services/download/downloadService")).DownloadService;
		const requestService = c.resolve(RequestService);
		const fileService = c.resolve(FileService);

		return new DownloadService(requestService, fileService);
	})
});
// End init and setup services ===================================================

const appCode = container.resolve(MainApplication);
appCode.startup();
