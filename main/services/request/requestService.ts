import { IConfiguration } from '../config/configuration';
import { ILogService } from '../log/log';
import { IRequestService, IRequestContext, IRequestOptions, IHTTPConfiguration } from './request';
import { injectable, inject } from "tsyringe";
import { BaseService } from '../base/service';

@injectable()
export class RequestService extends BaseService implements IRequestService {

	private proxyUrl?: string;
	private strictSSL: boolean | undefined;
	private authorization?: string;

	constructor(
		@inject("IConfiguration") configurationService: IConfiguration,
		@inject("ILogService") private readonly logService: ILogService
	) {
		super();
		this.configure(configurationService.getValue<IHTTPConfiguration>('section name'));
		console.log("RequestService#Constructor");
	}

	serviceDidInit() {
        this.logService.info("RequestService#Init");
    }
	
    serviceDidReady() {
        this.logService.info("RequestService#Ready");
    }

	dispose() {
        console.log("RequestService#dispose");	
        super.dispose();
    }
	
	setup() {
		this.logService.info("RequestService#Setup");
	}

	private configure(config: IHTTPConfiguration) {
		// this.proxyUrl = config.http && config.http.proxy;
		// this.strictSSL = !!(config.http && config.http.proxyStrictSSL);
		// this.authorization = config.http && config.http.proxyAuthorization;
		this.proxyUrl = "config.http && config.http.proxy";
		this.strictSSL = true;
		this.authorization = 'config.http && config.http.proxyAuthorization';
	}

	async request(options: IRequestOptions): Promise<IRequestContext> {
		this.logService.trace('RequestService#request', options.url);

		// process st

		return this._request(options);
	}

	private _request(options: IRequestOptions): Promise<IRequestContext> {

		return new Promise<IRequestContext>(async (c, e) => {
			// process, make request
		});
	}
}
