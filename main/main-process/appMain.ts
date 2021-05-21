import { IConfiguration } from "../services/config/configuration";
import { IEnvironmentService } from "../services/enviroment/enviroment";
import { ILifeCycle } from "../services/base/lifecycle";
import { ILogService } from "../services/log/log";
import { ILifecycleMainService } from "../services/mainLifecycle/mainLifecycle";
import { IStateService } from "../services/state/state";
import { IApp } from "../services/base/app";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { injectable, inject } from "tsyringe";
import { BaseService } from "../services/base/service";
import { URI } from "../common/uri";
import { InitWindowOptions } from "../services/types";
import { getServiceManager } from "../services/base/serviceManager";
import { containerConfig as config } from "../services/base/token";


let mainWindow: BrowserWindow | null;


@injectable()
export class MainApplication extends BaseService implements IApp, ILifeCycle {

    private initPromise: Promise<void> | undefined;
    private downloadWindow: BrowserWindow | undefined;

    constructor(
        @inject(config.TOKEN_ICONFIGURATION.value) private readonly configuration: IConfiguration,
        @inject(config.TOKEN_IENVIROMENT.value) private readonly enviromentService: IEnvironmentService,
        @inject(config.TOKEN_ILIFECYCLEMAIN.value) private readonly lifecycleService: ILifecycleMainService,
        @inject(config.TOKEN_ISTATE.value) private readonly stateService: IStateService,
        @inject(config.TOKEN_ILOG.value) private readonly logService: ILogService
    ) {
        super();
        this.registerListeners();
        logService.info("MainApplication#constructor");
    }

    registerListeners() {
        app.allowRendererProcessReuse = false;
        process.on('uncaughtException', err => this.logService.error(err));
        process.on('unhandledRejection', (reason: unknown) => this.logService.error("appMain#unhandledRejection"));

        this.lifecycleService.onBeforeShutdown(() => {
            this.logService.info("Shutdown#Call-from-app-main");
        })

        // this.lifecycleService.onWillShutdown(() => {
        //     this.dispose();
        // })

        app.on('ready', e => this.openMainWindow());
        app.on('activate', (e, hasVisiblewindiws) => this.resume());

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

        ipcMain.on('main:download', this.downloadSomething);
        ipcMain.on('main:asyncdownload', this.asyncDownloadSomething);
        ipcMain.on('main:runsomerequest', this.runSomeRequest);
        ipcMain.on('main:runsomeasyncrequest', this.asyncRunSomeRequest);
    }

    setup() {
        this.logService.info(`AppMain#Setup`);
    }

    serviceDidInit() {
        this.logService.info(`AppMain#Init`);
    }

    serviceDidReady() {
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

    dispose() {
        this.logService.trace('app#dispose');
        super.dispose();
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

    // Use async service in sync method
    downloadSomething() {
        const download = getServiceManager().resolve(config.TOKEN_ASYNC_IDOWNLOAD);
        
        if (download) {
            download.download(new URI("downloadSomething"), new URI(""));
        } else {
            console.log("Download never fulfill before, please use resolveAsync instead!");
        }
    }

    // Use async service in async method
    async asyncDownloadSomething() {
        const download = await getServiceManager().resolveAsync(config.TOKEN_ASYNC_IDOWNLOAD);
        download.download(new URI("asyncDownloadSomething"), new URI(""));
    }

    runSomeRequest() {
        const req = getServiceManager().resolve(config.TOKEN_IREQUEST)
        req.request({url: "runSomeRequest"});
    }

    async asyncRunSomeRequest() {
        const req = await getServiceManager().resolveAsync(config.TOKEN_IREQUEST);
        req.request({url: "asyncRunSomeRequest"});
    }
}