import { IEnvironmentService } from "../enviroment/enviroment";
import * as fs from 'fs';
import { isUndefined, isUndefinedOrNull } from "../../common/utils";
import { IStateService } from "./state";
import { ILogService } from "../log/log";
import { inject, singleton } from "tsyringe";
import { BaseService } from "../base/service";
import { containerConfig as config } from "../base/token";
import { ZAsingleton } from "../base/decorator";


type StorageDatabase = { [key: string]: any; };

// ex: working dir picker
// marker, ex quite from restart
// last know menubar, theme, background
// recently open
export class FileStorage {

	private _database: StorageDatabase | null = null;
	private lastFlushedSerializedDatabase: string | null = null;

	constructor(private dbPath: string, private onError: (error: Error) => void) { }

	private get database(): StorageDatabase {
		if (!this._database) {
			this._database = this.loadSync();
		}

		return this._database;
	}

	async init(): Promise<void> {
		if (this._database) {
			return; // return if database was already loaded
		}

		const database = await this.loadAsync();

		if (this._database) {
			return; // return if database was already loaded
		}

		this._database = database;
		console.log('did init storage DB');
	}

	private loadSync(): StorageDatabase {
		try {
			this.lastFlushedSerializedDatabase = fs.readFileSync(this.dbPath).toString();

			return JSON.parse(this.lastFlushedSerializedDatabase);
		} catch (error) {
			if (error.code !== 'ENOENT') {
				this.onError(error);
			}

			return {};
		}
	}

	private async loadAsync(): Promise<StorageDatabase> {
		try {
			this.lastFlushedSerializedDatabase = (await fs.promises.readFile(this.dbPath)).toString();

			return JSON.parse(this.lastFlushedSerializedDatabase);
		} catch (error) {
			if (error.code !== 'ENOENT') {
				this.onError(error);
			}

			return {};
		}
	}

	getItem<T>(key: string, defaultValue: T): T;
	getItem<T>(key: string, defaultValue?: T): T | undefined;
	getItem<T>(key: string, defaultValue?: T): T | undefined {
		const res = this.database[key];
		if (isUndefinedOrNull(res)) {
			return defaultValue;
		}

		return res;
	}

	setItem(key: string, data?: object | string | number | boolean | undefined | null): void {

		// Remove an item when it is undefined or null
		if (isUndefinedOrNull(data)) {
			return this.removeItem(key);
		}

		// Shortcut for primitives that did not change
		if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
			if (this.database[key] === data) {
				return;
			}
		}

		this.database[key] = data;
		this.saveSync();
	}

	removeItem(key: string): void {

		// Only update if the key is actually present (not undefined)
		if (!isUndefined(this.database[key])) {
			this.database[key] = undefined;
			this.saveSync();
		}
	}

	private saveSync(): void {
		const serializedDatabase = JSON.stringify(this.database, null, 4);
		if (serializedDatabase === this.lastFlushedSerializedDatabase) {
			return; // return early if the database has not changed
		}

		try {
			// write file, may be got permission issue
		} catch (error) {
			this.onError(error);
		}
	}
}

@ZAsingleton()
export class StateService extends BaseService implements IStateService {

	// private static readonly STATE_FILE = 'storage.json';

	private fileStorage: FileStorage;

	constructor(
		@inject(config.TOKEN_IENVIROMENT.value) private readonly environmentService: IEnvironmentService,
		@inject(config.TOKEN_ILOG.value) private readonly logService: ILogService
	) {
		super();
		this.fileStorage = new FileStorage(environmentService.userDataPath /* combine with StateService.STATE_FILE*/, error => logService.error(error));
		this.logService.info("StateService#Constructor");
	}

	serviceDidInit() {
        this.logService.info("StateService#Init");
    }
	
    serviceDidReady() {
        this.logService.info("StateService#Ready");
    }

	dispose() {
        console.log("StateService#dispose");	
        super.dispose();
    }

	setup(): Promise<void> {
		this.logService.info("StateService#Setup")
		return this.fileStorage.init();
	}

	getItem<T>(key: string, defaultValue: T): T;
	getItem<T>(key: string, defaultValue?: T): T | undefined;
	getItem<T>(key: string, defaultValue?: T): T | undefined {
		return this.fileStorage.getItem(key, defaultValue);
	}

	setItem(key: string, data?: object | string | number | boolean | undefined | null): void {
		this.fileStorage.setItem(key, data);
	}

	removeItem(key: string): void {
		this.fileStorage.removeItem(key);
	}
}
