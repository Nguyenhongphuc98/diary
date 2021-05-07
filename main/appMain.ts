import { IConfiguration } from "./services/config/configuration";
import { IEnvironmentService } from "./services/enviroment/enviroment";
import { LifeCycle } from "./services/lifecycle";
import { ILogService } from "./services/log/log";
import { ILifecycleMainService } from "./services/mainLifecycle/mainLifecycle";
import { IStateService } from "./services/state/state";
import { IApp } from "./app";
import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";
import { injectable, inject } from "tsyringe";

let mainWindow: BrowserWindow | null;

@injectable()
export class MainApplication extends LifeCycle implements IApp {

    private initPromise: Promise<void> | undefined;

    constructor(
        @inject("IConfiguration") private readonly configuration: IConfiguration,
        @inject("IEnvironmentService") private readonly enviromentService: IEnvironmentService,
        @inject("ILifecycleMainService") private readonly lifecycleService: ILifecycleMainService,
        @inject("IStateService") private readonly stateService: IStateService,
        @inject("ILogService") private readonly logService: ILogService
    ) {
        super();
        this.registerListeners();
    }

    registerListeners() {
        app.allowRendererProcessReuse = false;
        process.on('uncaughtException', err => this.lifecycleService.onError(err));
        process.on('unhandledRejection', (reason: unknown) => this.lifecycleService.onError(reason));

        app.on('ready', e => this.initWindow());
        app.on('activate', (e, hasVisiblewindiws) => this.onResume());
        app.on('will-quit', e => this.onDeInit());

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

			if (module !== 'clipboard') {
				event.preventDefault();
			}
		});
		app.on('remote-get-current-window', event => {
			this.logService.trace(`app#on(remote-get-current-window): prevented`);
			event.preventDefault();
		});
		app.on('remote-get-current-web-contents', event => {
			this.logService.trace(`app#on(remote-get-current-web-contents): prevented`);
			event.preventDefault();
		});
    }

    startup() {
        this.logService.info('app#startup');
        this.logService.debug(`from: ${this.enviromentService.appRoot}`);
    }

    onPause() {
        this.logService.trace('app#pause');
    }

    onResume() {
        this.logService.trace('app#active');
    }

    onDeInit() {
        this.logService.trace('app#deinit');
    }

    initWindow() {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            // show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
            },
        });

        if (process.env.NODE_ENV === "development") {
            mainWindow.loadURL(`http://localhost:4000`);
            mainWindow.webContents.openDevTools();
        } else {

            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, "index.html"),
                    protocol: "file:",
                    slashes: true,
                })
            );
        }

        mainWindow.on("closed", () => {
            this.onPause();
            mainWindow = null;
        });
    }
}