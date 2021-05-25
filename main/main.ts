
import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
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
import { getServiceManager } from "./services/base/serviceManager";
import { IRequestService } from "./services/request/request";
import { IFileService } from "./services/file/file";
import { containerConfig as config } from "./services/base/token";
import { IDownload } from "./services/download/download";
import { castPromise } from "./common/utils";

// // Begin init and setup services ===================================================
// // ==================================================================================

const sm = getServiceManager();

// sm.register(
// 	config.TOKEN_IFILE, {
// 	useClass: FileService
// });

// sm.register(
// 	config.TOKEN_ISTATE, {
// 	useClass: StateService
// });

// sm.register(config.TOKEN_ILOG, {
// 	useFactory: (c => {
// 		const fileService = sm.resolve(FileService);
// 			const uri = new URI('uri')
// 			return new FileLogService('internal log', uri, LogLevel.Info, fileService);
// 	})
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
// 	useFactory:  async c => {
// 		const DownloadService = (await import("./services/download/downloadService")).DownloadService;
// 		const requestService = sm.resolve(RequestService);
// 		const fileService = sm.resolve(FileService);

// 		return new DownloadService(requestService, fileService);
// 	}
// })
// // End init and setup services ===================================================

// const appCode = sm.resolve(MainApplication);
// appCode.startup();


// test register async but we did resolve it and value is fulfill before
// result should be able to get sync
sm.register(
	config.TOKEN_IENVIROMENT, {
	useClass: EnviromentService
});
sm.register(config.TOKEN_ASYNC_IENVIROMENT, {
	useFactory: async c => {
		return sm.resolve(config.TOKEN_IENVIROMENT);
	}
})

const t = sm.resolveAsync(config.TOKEN_ASYNC_IENVIROMENT);

setTimeout(() => {
	const t2 = sm.resolve(config.TOKEN_ASYNC_IENVIROMENT);
	t.value!.appRoot = "abc";
	console.log("t1", t.value?.appRoot);
	console.log("t2",t2!.appRoot);
}, 1000);


// container.register('ConfigurationService', {useClass: ConfigurationService}, {lifecycle: Lifecycle.Singleton});
// const c1 = container.resolve('ConfigurationService');
// (c1 as ConfigurationService ).language = 'en'
// const c2 = container.createChildContainer().resolve('ConfigurationService');
// console.log((c2 as ConfigurationService ).language);

// class A {
// 	constructor() {
		
// 	}
// }
// container.register('a', {
// 	useFactory: c => {
// 		return {a: 'a'};
// 	}
// })

// const t = container.resolve('a');
// console.log((t as Object).constructor());
