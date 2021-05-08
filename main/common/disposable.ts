
export interface IDisposable {
	dispose(): void;
}

export class DisposableStore implements IDisposable {

	static DISABLE_DISPOSED_WARNING = false;

	private _toDispose = new Set<IDisposable>();
	private _isDisposed = false;

	/**
	 * Dispose of all registered disposables and mark this object as disposed.
	 *
	 * Any future disposables added to this object will be disposed of on `add`.
	 */
	public dispose(): void {
		if (this._isDisposed) {
			return;
		}

		this._isDisposed = true;
		this.clear();
	}

	/**
	 * Dispose of all registered disposables but do not mark this object as disposed.
	 */
	public clear(): void {
		try {
			this._toDispose.forEach(d => { d.dispose(); })
		} finally {
			this._toDispose.clear();
		}
	}

	public add<T extends IDisposable>(t: T): T {
		if (!t) {
			return t;
		}
		if ((t as unknown as DisposableStore) === this) {
			throw new Error('Cannot register a disposable on itself!');
		}

		if (this._isDisposed) {
			if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
				console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
			}
		} else {
			this._toDispose.add(t);
		}

		return t;
	}
}

export abstract class Disposable implements IDisposable {

	static readonly None = Object.freeze<IDisposable>({ dispose() { } });

	private readonly _store = new DisposableStore();

	constructor() {

	}

	public dispose(): void {

		console.log("Disposable#dispose");
		this._store.dispose();
	}

	protected _register<T extends IDisposable>(t: T): T {
		if ((t as unknown as Disposable) === this) {
			throw new Error('Cannot register a disposable on itself!');
		}
		return this._store.add(t);
	}
}