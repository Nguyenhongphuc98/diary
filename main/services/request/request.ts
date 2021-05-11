
export interface IRequestService {

    request(options: IRequestOptions): Promise<IRequestContext>;
}

export interface IHeaders {
	[header: string]: string;
}

export interface IRequestOptions {
	type?: string;
	url?: string;
	user?: string;
	password?: string;
	headers?: IHeaders;
	timeout?: number;
	data?: string;
	followRedirects?: number;
	proxyAuthorization?: string;
}

export interface IRequestContext {
	res: {
		headers: IHeaders;
		statusCode?: number;
	};
	stream: VSBufferReadableStream;
}

export interface VSBufferReadableStream { 

}

export interface IHTTPConfiguration {
	http?: {
		proxy?: string;
		proxyStrictSSL?: boolean;
		proxyAuthorization?: string;
	};
}