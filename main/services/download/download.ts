import { inject, injectable } from "tsyringe";
import { URI } from "../../common/uri";

export interface IDownload {

	download(uri: URI, to: URI): Promise<void>;
}

// @injectable()
// export class DownloadWrapper {

// 	constructor(
// 		@inject("IDownload") private readonly downloadService: Promise<IDownload>
// 	) { }

// 	async setup() {
// 		return await this.downloadService;
// 	}
// }