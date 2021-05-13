import { IConfiguration } from "../services/config/configuration";
import { IEnvironmentService } from "../services/enviroment/enviroment";
import { ILifeCycle } from "../services/base/lifecycle";
import { ILogService } from "../services/log/log";
import { ILifecycleMainService } from "../services/mainLifecycle/mainLifecycle";
import { IStateService } from "../services/state/state";
import { IApp } from "../services/base/app";
import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import * as path from "path";
import * as url from "url";
import { injectable, inject, container } from "tsyringe";
import { Emitter, Event } from "../common/event";
import { Disposable } from "../common/disposable";
import { BaseService } from "../services/base/service";
import { DownloadWrapper, IDownload } from "../services/download/download";
import { URI } from "../common/uri";
import { InitWindowOptions } from "../services/types";

let mainWindow: BrowserWindow | null;

@injectable()
export class MainApplication extends BaseService implements IApp, ILifeCycle {

    private initPromise: Promise<void> | undefined;
    private downloadWindow: BrowserWindow | undefined;

    constructor(
        @inject("IConfiguration") private readonly configuration: IConfiguration,
        @inject("IEnvironmentService") private readonly enviromentService: IEnvironmentService,
        @inject("ILifecycleMainService") private readonly lifecycleService: ILifecycleMainService,
        @inject("IStateService") private readonly stateService: IStateService,
        @inject("ILogService") private readonly logService: ILogService
    ) {
        super();
        this.openDownloadWindow = this.openDownloadWindow.bind(this);
        this.registerListeners();
    }

    registerListeners() {
        app.allowRendererProcessReuse = false;
        process.on('uncaughtException', err => this.logService.error(err));
        process.on('unhandledRejection', (reason: unknown) => this.logService.error("appMain#unhandledRejection"));

        this.lifecycleService.onBeforeShutdown(() => {
            this.logService.info("Shutdown#Call-from-app-main");
        })

        this.lifecycleService.onWillShutdown(() => {
            this.dispose();
        })

        app.on('ready', e => this.openMainWindow());
        app.on('activate', (e, hasVisiblewindiws) => this.resume());
        app.on('will-quit', e => this.deInit());

        app.on('remote-require', (event, sender, module) => {
            this.logService.trace('app#on(remote-require): prevented');
            event.preventDefault();
        });
        app.on('remote-get-global', (event, sender, module) => {
            this.logService.trace(`app#on(remote-get-global): prevented on ${module}`);
            event.preventDefault();
        });
        app.on('remote-get-builtin', (event, sender, module) => {
            this.logService.trace(`app#on(remote-get-builtin): prevented on ${module}`);
            event.preventDefault();
        });
        app.on('remote-get-current-window', event => {
            this.logService.trace(`app#on(remote-get-current-window): prevented`);
            event.preventDefault();
        });
        app.on('remote-get-current-web-contents', event => {
            this.logService.trace(`app#on(remote-get-current-web-contents): prevented`);
            event.preventDefault();
        });

        ipcMain.on('main:openDownloadWindow', this.openDownloadWindow);
    }

    setup() {
        this.logService.info(`AppMain#Setup`);
    }

    didInit() {
        this.logService.info(`AppMain#Init`);
    }

    didReady() {
        this.logService.info(`AppMain#Ready`);
    }

    startup() {
        this.logService.info('app#startup');
        this.logService.debug(`from: ${this.enviromentService.appRoot}`);
    }

    pause() {
        this.logService.trace('app#pause');
        this._onPause.fire();
    }

    resume() {
        this.logService.trace('app#active');
        this._onResume.fire();
    }

    deInit() {
        this.logService.trace('app#deinit');
        this._onDeInit.fire();
    }

    openMainWindow() {
        mainWindow = this.initWindow({ contentName: "index.html" });
        mainWindow.on("closed", () => {
            this.pause();
            mainWindow = null;
        });
    }

    initWindow(options: InitWindowOptions): BrowserWindow {
        let { width, height, nodeIntegration, webSecurity, contentName } = options;
        width = width || 800;
        height = height || 600;
        nodeIntegration = nodeIntegration || true;
        webSecurity = webSecurity || false;

        let window = new BrowserWindow({
            width: width,
            height: height,
            webPreferences: {
                nodeIntegration: nodeIntegration,
                webSecurity: nodeIntegration,
            },
        });

        if (process.env.NODE_ENV === "development") {
            const url = "http://localhost:4000" + (contentName === "index.html" ? "" : `/${contentName}`);
            window.loadURL(url);
            // window.webContents.openDevTools();
        } else {

            window.loadURL(
                url.format({
                    pathname: path.join(__dirname, contentName),
                    protocol: "file:",
                    slashes: true,
                })
            );
        }

        return window;
    }

    setupDownloadService(): Promise<IDownload> {
        const downloadWrapper = container.resolve(DownloadWrapper);
        return downloadWrapper.setup();
    }

    openDownloadWindow() {
        console.log("main:opendownload");

        this
            .setupDownloadService()
            .then(d => {
                d.download(new URI(""), new URI(""));
                this.downloadWindow = this.initWindow({ contentName: "nothing.html" });
            });
    }
}