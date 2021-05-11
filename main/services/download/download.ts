import { inject, injectable } from "tsyringe";
import { URI } from "../../common/uri";
import { ILifeCycle } from "../base/lifecycle";

export interface IDownload {

	download(uri: URI, to: URI): Promise<void>;
}

@injectable()
export class DownloadWraper {

	constructor(
		@inject("IDownload") private readonly downloadService: Promise<IDownload>
	) { }

	async setup() {
		return await this.downloadService;
	}
}