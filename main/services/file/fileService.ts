import { URI } from "../../common/uri";
import { IBuffer, ICreateFileOptions, IFileService, IReadFileOptions, IBaseStat } from "./file";
import { LifeCycle } from "../lifecycle";
import { LifeCycleState, NoInputHandle } from "../types";


export class FileService extends LifeCycle implements IFileService {

    constructor() {
        super();
        this.onInit();
    }

    onInit() {
        console.log('FileService did init');
    }

    async exists(resource: URI): Promise<boolean> {
        return true;
    }

    canHandleResource(resource: URI): boolean {
        return true;
    }

    read(resource: URI, options: IReadFileOptions) {
        
    }

    write(resource: URI, buffer: IBuffer) {
        
    }

    canMove(source: URI, target: URI, overwrite?: boolean): Promise<true | Error> {
        throw new Error("Method not implemented.");
    }

    move(source: URI, target: URI, overwrite?: boolean): Promise<IBaseStat> {
        throw new Error("Method not implemented.");
    }

    copy(source: URI, target: URI, overwrite?: boolean): Promise<IBaseStat> {
        throw new Error("Method not implemented.");
    }

    canCopy(source: URI, target: URI, overwrite?: boolean): Promise<true | Error> {
        throw new Error("Method not implemented.");
    }

    canCreateFile(resource: URI, options?: ICreateFileOptions): Promise<true | Error> {
        throw new Error("Method not implemented.");
    }

    createFile(resource: URI, buffer?: Buffer, options?: ICreateFileOptions): Promise<IBaseStat> {
        console.log('did create file ' +resource);
        return Promise.resolve({
            resource: new URI(''),
            name: 'a'
        });
    }
}