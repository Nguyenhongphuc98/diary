import { URI } from "../../common/uri";
import { IFileService } from "../file/file";
import { IRequestService } from "../request/request";
import { IDownload } from "./download";
import {inject, injectable} from "tsyringe";
import { BaseService } from "../base/service";
import { containerConfig as config } from "../base/token";

@injectable()
export class DownloadService extends BaseService implements IDownload {

	constructor(
		@inject(config.TOKEN_IREQUEST.value) private readonly requestService: IRequestService,
		@inject(config.TOKEN_IFILE.value) private readonly fileService: IFileService
	) { 
        super();
		console.log("DownloadService#Constructor");	
    }

	serviceDidInit() {
        console.log("DownloadService#Init");	
    }
	
    serviceDidReady() {
        console.log("DownloadService#Ready");	
    }

	dispose() {
        console.log("DownloadService#dispose");	
        super.dispose();
    }

	setup() {
		console.log('DownloadService#Setup');
	}

	async download(resource: URI, target: URI): Promise<void> {
		console.log("Download method did call");
		
		// support copy file if src is local
        // modify options if needed and make request to resource
        // base on result, use file service to handle
	
        const options = { type: 'GET', url: resource.toString() };
		const context = await this.requestService.request(options);
		if (context.res.statusCode === 200) {
			await this.fileService.write(target, context.stream);
		} else {
			const message = 'to text from context';
			throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
		}
	}
}