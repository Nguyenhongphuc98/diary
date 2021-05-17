import { URI } from "../../common/uri";
import { IFileService } from "../file/file";
import { ILogService, LogLevel, AbstractLog } from "./log";
import { injectable, inject } from "tsyringe";

@injectable()
export class FileLogService extends AbstractLog implements ILogService {

	private readonly initializePromise: Promise<void> | undefined;

	constructor(
		private readonly name: string,
		private readonly resource: URI,
		level: LogLevel,
		@inject("IFileService") private readonly fileService: IFileService
	) {
		super();
		this.setLevel(level);
		console.log("FileLogService#Constructor");
	}

	serviceDidInit() {
        console.log("FileLogService#Init");	
    }
	
    serviceDidReady() {
        console.log("FileLogService#Ready");	
    }
	
	dispose() {
        console.log("FileLogService#dispose");	
        super.dispose();
    }

	// If not init at constructor, should be called before use any other method
	async asyncSetup(): Promise<void> {
		try {
			console.log("FileLogService#Setup");
			await this.fileService.createFile(this.resource);
		} catch (error) {
			throw error;
		}
	}

	trace(message: string, ...args: any[]): void {
		this._log(LogLevel.Trace, message);
	}

	debug(message: string, ...args: any[]): void {
		this._log(LogLevel.Debug, message);
	}

	info(message: string, ...args: any[]): void {
		this._log(LogLevel.Info, message);
	}

	warn(message: string, ...args: any[]): void {
		this._log(LogLevel.Warning, message);
	}

	error(message: string | Error, ...args: any[]): void {
		this._log(LogLevel.Error, message.toString());
	}

	critical(message: string | Error, ...args: any[]): void {
		this._log(LogLevel.Critical, message.toString());
	}

	private async _log(level: LogLevel, message: string): Promise<void> {
		// if (!this.initializePromise) {
		// 	throw new Error("Use before setup");
		// }
		// // Add to queue ?
		// await this.initializePromise;
		// Load file, check file-size
		// If not exceed max size -> write
		// timestamp - name - level - message
		const data = `[${this._getCurrentTimestamp()}] [${this.name}] [${this._stringifyLogLevel(level)}] ${message}`;
		this.fileService.write(this.resource, {}); // :)
		console.log(data);
	}

	private _getCurrentTimestamp(): string {
		const toTwoDigits = (v: number) => v < 10 ? `0${v}` : v;
		const toThreeDigits = (v: number) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v;
		const currentTime = new Date();
		return `${currentTime.getFullYear()}-${toTwoDigits(currentTime.getMonth() + 1)}-${toTwoDigits(currentTime.getDate())} ${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
	}

	private _stringifyLogLevel(level: LogLevel): string {
		switch (level) {
			case LogLevel.Critical: return 'critical';
			case LogLevel.Debug: return 'debug';
			case LogLevel.Error: return 'error';
			case LogLevel.Info: return 'info';
			case LogLevel.Trace: return 'trace';
			case LogLevel.Warning: return 'warning';
		}
		return '';
	}
}
