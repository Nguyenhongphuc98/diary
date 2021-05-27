
import "reflect-metadata";
import { container, Lifecycle, singleton } from "tsyringe";
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
import { getServiceManager, ServiceManager } from "./services/base/serviceManager";
import { IRequestService } from "./services/request/request";
import { IFileService } from "./services/file/file";
import { containerConfig as config } from "./services/base/token";
import { IDownload } from "./services/download/download";
import { castPromise } from "./common/utils";
import { SMLifecycle } from "./services/base/registry";

// Begin init and setup services ===================================================
// ==================================================================================

// const sm = getServiceManager();

// sm.register(
// 	config.TOKEN_IFILE, {
// 	useClass: FileService
// });

// sm.register(
// 	config.TOKEN_ISTATE, {
// 	useClass: StateService
// });

// sm.register(config.TOKEN_ILOG, {
// 	useFactory: c => {
// 		sm.register(config.TOKEN_FILELOGNAME, {
// 			useValue: "Internal log"
// 		})

// 		sm.register(config.TOKEN_FILELOGURI, {
// 			useValue: new URI('uri')
// 		})

// 		sm.register(config.TOKEN_FILELOGLEVEL, {
// 			useValue: LogLevel.Info
// 		})
// 		return sm.resolve(FileLogService);
// 	}
// })

// sm.register(
// 	config.TOKEN_ICONFIGURATION, {
// 	useClass: ConfigurationService
// });

// sm.register(
// 	config.TOKEN_IENVIROMENT, {
// 	useClass: EnviromentService
// });

// sm.register(
// 	config.TOKEN_IREQUEST, {
// 	useClass: RequestService
// });

// sm.register(
// 	config.TOKEN_ILIFECYCLEMAIN, {
// 	useClass: MainLifecycleService
// });

// sm.register(config.TOKEN_ASYNC_IDOWNLOAD, {
// 	useFactory: async c => {
// 		const DownloadService = (await import("./services/download/downloadService")).DownloadService;
// 		return sm.resolve(DownloadService);
// 	}
// })
// // End init and setup services ===================================================

// const appCode = sm.resolve(MainApplication);
// appCode.startup();


//============================================================================
// Test register options on class provider
// const sm = new ServiceManager();

// sm.register(
// 	config.TOKEN_IFILE, {
// 	useClass: FileService
// }, {lifecycle: SMLifecycle.Singleton});

// const t = sm.resolve(config.TOKEN_IFILE);
// const t2 = sm.resolve(config.TOKEN_IFILE);

// const t3 = sm.resolveAsync(config.TOKEN_ASYNC_IDOWNLOAD);
// setTimeout(() => {
// 	const t4 = sm.resolve(config.TOKEN_ASYNC_IDOWNLOAD);
// }, 1000);

//============================================================================
// Test register singleton for ctor, all resolve after that will same instance
const sm = new ServiceManager();

sm.registerSingleton(FileService);

sm.resolve(FileService);
sm.resolve(FileService);

sm.register(
	config.TOKEN_IFILE, {
	useClass: FileService
});

sm.resolve(config.TOKEN_IFILE);
