/*---------------------------------------------------------------------------------------------
 *  Declare key token as well as define require data type when register service.
 *  do not make modify this file, unless we have use new service in future
 *--------------------------------------------------------------------------------------------*/

import { URI } from "../../common/uri";
import { IConfiguration } from "../config/configuration";
import { IDownload } from "../download/download";
import { IEnvironmentService } from "../enviroment/enviroment";
import { IFileService } from "../file/file";
import { ILogService, LogLevel } from "../log/log";
import { ILifecycleMainService } from "../mainLifecycle/mainLifecycle";
import { IRequestService } from "../request/request";
import { IStateService } from "../state/state";
import { CachePromise } from "../types";
import { IService } from "./service";

export interface STLikeService {

}

export class CustomToken<T> {
	constructor(readonly value) { }
}

export class CustomPromiseToken<T extends CachePromise<T2>, T2> {
    private readonly promise = true;
	constructor(readonly value) { }
}

export namespace containerConfig {
	export const TOKEN_IFILE = new CustomToken<IFileService>("IFileService");
    export const TOKEN_FILELOGNAME = new CustomToken<string>("FileLogName");
    export const TOKEN_FILELOGURI = new CustomToken<URI>("FileLogUri");
    export const TOKEN_FILELOGLEVEL = new CustomToken<LogLevel>("FileLogLevel");

    export const TOKEN_ISTATE = new CustomToken<IStateService>("IStateService");
    export const TOKEN_ILOG = new CustomToken<ILogService>("ILogService");
    export const TOKEN_ICONFIGURATION = new CustomToken<IConfiguration>("IConfiguration");
    export const TOKEN_IENVIROMENT = new CustomToken<IEnvironmentService>("IEnvironmentService");
    export const TOKEN_IREQUEST = new CustomToken<IRequestService>("IRequestService");
    export const TOKEN_ILIFECYCLEMAIN = new CustomToken<ILifecycleMainService>("ILifecycleMainService");

    export const TOKEN_ASYNC_IDOWNLOAD = new CustomPromiseToken<CachePromise<IDownload>, IDownload>("IDownload");
    export const TOKEN_ASYNC_IENVIROMENT = new CustomPromiseToken<CachePromise<IEnvironmentService>, IEnvironmentService>("IAsyncEnvironmentService");
    
    // Add more token here when have new service
}
