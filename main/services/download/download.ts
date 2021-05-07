import { URI } from "../../common/uri";
import { LifeCycle } from "../lifecycle";

export interface IDownload {

	download(uri: URI, to: URI): Promise<void>;
}
