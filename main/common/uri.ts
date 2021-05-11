/*---------------------------------------------------------------------------------------------
 *  Clone from Microsoft.
 *--------------------------------------------------------------------------------------------*/

import {CharCode} from './charCode';

const _schemePattern = /^\w[\w\d+.-]*$/;
const _singleSlashStart = /^\//;
const _doubleSlashStart = /^\/\//;

function _validateUri(ret: URI, _strict?: boolean): void {

	// scheme, must be set
	if (!ret.scheme && _strict) {
		throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
	}

	// scheme, https://tools.ietf.org/html/rfc3986#section-3.1
	// ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
	if (ret.scheme && !_schemePattern.test(ret.scheme)) {
		throw new Error('[UriError]: Scheme contains illegal characters.');
	}

	// path, http://tools.ietf.org/html/rfc3986#section-3.3
	// If a URI contains an authority component, then the path component
	// must either be empty or begin with a slash ("/") character.  If a URI
	// does not contain an authority component, then the path cannot begin
	// with two slash characters ("//").
	if (ret.path) {
		if (ret.authority) {
			if (!_singleSlashStart.test(ret.path)) {
				throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
			}
		} else {
			if (_doubleSlashStart.test(ret.path)) {
				throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
			}
		}
	}
}

// for a while we allowed uris *without* schemes and this is the migration
// for them, e.g. an uri without scheme and without strict-mode warns and falls
// back to the file-scheme. that should cause the least carnage and still be a
// clear warning
function _schemeFix(scheme: string, _strict: boolean): string {
	if (!scheme && !_strict) {
		return 'file';
	}
	return scheme;
}

// implements a bit of https://tools.ietf.org/html/rfc3986#section-5
function _referenceResolution(scheme: string, path: string): string {

	// the slash-character is our 'default base' as we don't
	// support constructing URIs relative to other URIs. This
	// also means that we alter and potentially break paths.
	// see https://tools.ietf.org/html/rfc3986#section-5.1.4
	switch (scheme) {
		case 'https':
		case 'http':
		case 'file':
			if (!path) {
				path = _slash;
			} else if (path[0] !== _slash) {
				path = _slash + path;
			}
			break;
	}
	return path;
}

const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */
export class URI implements UriComponents {

	static isUri(thing: any): thing is URI {
		if (thing instanceof URI) {
			return true;
		}
		if (!thing) {
			return false;
		}
		return typeof (<URI>thing).authority === 'string'
			&& typeof (<URI>thing).fragment === 'string'
			&& typeof (<URI>thing).path === 'string'
			&& typeof (<URI>thing).query === 'string'
			&& typeof (<URI>thing).scheme === 'string'
			&& typeof (<URI>thing).fsPath === 'string'
			// && typeof (<URI>thing).with === 'function'
			&& typeof (<URI>thing).toString === 'function';
	}

	/**
	 * scheme is the 'http' part of 'http://www.msft.com/some/path?query#fragment'.
	 * The part before the first colon.
	 */
	readonly scheme: string;

	/**
	 * authority is the 'www.msft.com' part of 'http://www.msft.com/some/path?query#fragment'.
	 * The part between the first double slashes and the next slash.
	 */
	readonly authority: string;

	/**
	 * path is the '/some/path' part of 'http://www.msft.com/some/path?query#fragment'.
	 */
	readonly path: string;

	/**
	 * query is the 'query' part of 'http://www.msft.com/some/path?query#fragment'.
	 */
	readonly query: string;

	/**
	 * fragment is the 'fragment' part of 'http://www.msft.com/some/path?query#fragment'.
	 */
	readonly fragment: string;

	public constructor(path: string) {
		// console.log('did init uri');
		this.scheme = "";
		this.authority = "";
		this.path = "";
		this.query = "";
		this.fragment = "";
	}

	// /**
	//  * @internal
	//  */
	// protected constructor(scheme: string, authority?: string, path?: string, query?: string, fragment?: string, _strict?: boolean);

	// /**
	//  * @internal
	//  */
	// protected constructor(components: UriComponents);

	// /**
	//  * @internal
	//  */
	// protected constructor(schemeOrData: string | UriComponents, authority?: string, path?: string, query?: string, fragment?: string, _strict: boolean = false) {

	// 	if (typeof schemeOrData === 'object') {
	// 		this.scheme = schemeOrData.scheme || _empty;
	// 		this.authority = schemeOrData.authority || _empty;
	// 		this.path = schemeOrData.path || _empty;
	// 		this.query = schemeOrData.query || _empty;
	// 		this.fragment = schemeOrData.fragment || _empty;
	// 		// no validation because it's this URI
	// 		// that creates uri components.
	// 		// _validateUri(this);
	// 	} else {
	// 		this.scheme = _schemeFix(schemeOrData, _strict);
	// 		this.authority = authority || _empty;
	// 		this.path = _referenceResolution(this.scheme, path || _empty);
	// 		this.query = query || _empty;
	// 		this.fragment = fragment || _empty;

	// 		_validateUri(this, _strict);
	// 	}
	// }

	// ---- filesystem path -----------------------

	/**
	 * Returns a string representing the corresponding file system path of this URI.
	 * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
	 * platform specific path separator.
	 *
	 * * Will *not* validate the path for invalid characters and semantics.
	 * * Will *not* look at the scheme of this URI.
	 * * The result shall *not* be used for display purposes but for accessing a file on disk.
	 *
	 *
	 * The *difference* to `URI#path` is the use of the platform specific separator and the handling
	 * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
	 *
	 * ```ts
		const u = URI.parse('file://server/c$/folder/file.txt')
		u.authority === 'server'
		u.path === '/shares/c$/file.txt'
		u.fsPath === '\\server\c$\folder\file.txt'
	```
	 *
	 * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
	 * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
	 * with URIs that represent files on disk (`file` scheme).
	 */
	get fsPath(): string {
		// if (this.scheme !== 'file') {
		// 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
		// }
		return uriToFsPath(this, false);
	}
}

export interface UriComponents {
	scheme: string;
	authority: string;
	path: string;
	query: string;
	fragment: string;
}

interface UriState extends UriComponents {
	$mid: number;
	external: string;
	fsPath: string;
	_sep: 1 | undefined;
}

/**
 * Compute `fsPath` for the given uri
 */
export function uriToFsPath(uri: URI, keepDriveLetterCasing: boolean): string {

	let value: string;
	if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
		// unc path: file://shares/c$/far/boo
		value = `//${uri.authority}${uri.path}`;
	} else if (
		uri.path.charCodeAt(0) === CharCode.Slash
		&& (uri.path.charCodeAt(1) >= CharCode.A && uri.path.charCodeAt(1) <= CharCode.Z || uri.path.charCodeAt(1) >= CharCode.a && uri.path.charCodeAt(1) <= CharCode.z)
		&& uri.path.charCodeAt(2) === CharCode.Colon
	) {
		if (!keepDriveLetterCasing) {
			// windows drive letter: file:///c:/far/boo
			value = uri.path[1].toLowerCase() + uri.path.substr(2);
		} else {
			value = uri.path.substr(1);
		}
	} else {
		// other path
		value = uri.path;
	}
	if (process.platform === 'win32') {
		value = value.replace(/\//g, '\\');
	}
	return value;
}

// --- decode

function decodeURIComponentGraceful(str: string): string {
	try {
		return decodeURIComponent(str);
	} catch {
		if (str.length > 3) {
			return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
		} else {
			return str;
		}
	}
}

const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;

function percentDecode(str: string): string {
	if (!str.match(_rEncodedAsHex)) {
		return str;
	}
	return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
}
