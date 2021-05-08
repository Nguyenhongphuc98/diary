import { ILifeCycle } from "../base/lifecycle";
import { BaseService } from "../base/service";

export enum LogLevel {
	Trace,
	Debug,
	Info,
	Warning,
	Error,
	Critical,
	Off
}

export const DEFAULT_LOG_LEVEL: LogLevel = LogLevel.Info;

export interface ILogService {
   
	getLevel(): LogLevel;
	setLevel(level: LogLevel): void;

	trace(message: string, ...args: any[]): void;
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string | Error, ...args: any[]): void;
	critical(message: string | Error, ...args: any[]): void;
}

export abstract class AbstractLog extends BaseService {

	private level: LogLevel = DEFAULT_LOG_LEVEL;

	setLevel(level: LogLevel): void {
		if (this.level !== level) {
			this.level = level;
			// fire event
		}
	}

	getLevel(): LogLevel {
		return this.level;
	}
}