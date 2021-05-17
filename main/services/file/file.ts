import { URI } from '../../common/uri';

export interface IFileService {

    exists(resource: URI): Promise<boolean>;

    canHandleResource(resource: URI): boolean;

    read(resource: URI, options: IReadFileOptions): Promise<IBaseStat>;

    write(resource: URI, buffer: IBuffer): Promise<IBaseStat>;

	move(source: URI, target: URI, overwrite?: boolean): Promise<IBaseStat>;

	canMove(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;

	copy(source: URI, target: URI, overwrite?: boolean): Promise<IBaseStat>;

	canCopy(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;

	canCreateFile(resource: URI, options?: ICreateFileOptions): Promise<Error | true>;

	createFile(resource: URI, buffer?: Buffer, options?: ICreateFileOptions): Promise<IBaseStat>;
}

export interface IReadFileOptions {

	/**
	 * Is an integer specifying where to begin reading from in the file. If position is undefined,
	 * data will be read from the current file position.
	 */
	readonly position?: number;

	/**
	 * Is an integer specifying how many bytes to read from the file. By default, all bytes
	 * will be read.
	 */
	readonly length?: number;

	/**
	 * If provided, the size of the file will be checked against the limits.
	 */
	limits?: {
		readonly size?: number;
		readonly memory?: number;
	};
}

export interface IBuffer {

}

export interface IBaseStat {

	/**
	 * The unified resource identifier of this file or folder.
	 */
	resource: URI;

	/**
	 * The name which is the last segment
	 * of the {{path}}.
	 */
	name: string;

	/**
	 * The size of the file.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	size?: number;

	/**
	 * The last modification date represented as millis from unix epoch.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	mtime?: number;

	/**
	 * The creation date represented as millis from unix epoch.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	ctime?: number;

	/**
	 * A unique identifier thet represents the
	 * current state of the file or directory.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	etag?: string;
}

export interface ICreateFileOptions {

	/**
	 * Overwrite the file to create if it already exists on disk. Otherwise
	 * an error will be thrown (FILE_MODIFIED_SINCE).
	 */
	readonly overwrite?: boolean;
}

export const enum FileOperationResult {
	FILE_IS_DIRECTORY,
	FILE_NOT_FOUND,
	FILE_NOT_MODIFIED_SINCE,
	FILE_MODIFIED_SINCE,
	FILE_MOVE_CONFLICT,
	FILE_WRITE_LOCKED,
	FILE_PERMISSION_DENIED,
	FILE_TOO_LARGE,
	FILE_INVALID_PATH,
	FILE_EXCEEDS_MEMORY_LIMIT,
	FILE_NOT_DIRECTORY,
	FILE_OTHER_ERROR
}