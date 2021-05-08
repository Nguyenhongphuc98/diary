import { Disposable, DisposableStore, IDisposable } from "./disposable";
import { LinkedList } from "./linkedList";

/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
	(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}

export namespace Event {
	export const None: Event<any> = () => Disposable.None;

	/**
	 * Given an event, returns another event which only fires once.
	 */
	export function once<T>(event: Event<T>): Event<T> {
		return (listener, thisArgs = null, disposables?) => {
			// we need this, in case the event fires during the listener call
			let didFire = false;
			let result: IDisposable;
			result = event(e => {
				if (didFire) {
					return;
				} else if (result) {
					result.dispose();
				} else {
					didFire = true;
				}

				return listener.call(thisArgs, e);
			}, null, disposables);

			if (didFire) {
				result.dispose();
			}

			return result;
		};
	}
}

export type Listener<T> = [(e: T) => void, any] | ((e: T) => void);

export interface EmitterOptions {
	onFirstListenerAdd?: Function;
	onFirstListenerDidAdd?: Function;
	onListenerDidAdd?: Function;
	onLastListenerRemove?: Function;
	leakWarningThreshold?: number;

	/** ONLY enable this during development */
	_profName?: string
}

/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
	class Document {

		private readonly _onDidChange = new Emitter<(value:string)=>any>();

		public onDidChange = this._onDidChange.event;

		// getter-style
		// get onDidChange(): Event<(value:string)=>any> {
		// 	return this._onDidChange.event;
		// }

		private _doIt() {
			//...
			this._onDidChange.fire(value);
		}
	}
 */
export class Emitter<T> {

	private static readonly _noop = function () { };

	private readonly _options?: EmitterOptions;
	private _disposed: boolean = false;
	private _event?: Event<T>;
	private _deliveryQueue?: LinkedList<[Listener<T>, T]>;
	protected _listeners?: LinkedList<Listener<T>>;

	constructor(options?: EmitterOptions) {
		this._options = options;
	}

	/**
	 * For the public to allow to subscribe
	 * to events from this Emitter
	 */
	get event(): Event<T> {
		if (!this._event) {
			this._event = (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore) => {
				if (!this._listeners) {
					this._listeners = new LinkedList();
				}

				const firstListener = this._listeners.isEmpty();

				if (firstListener && this._options && this._options.onFirstListenerAdd) {
					this._options.onFirstListenerAdd(this);
				}

				const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);

				if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
					this._options.onFirstListenerDidAdd(this);
				}

				if (this._options && this._options.onListenerDidAdd) {
					this._options.onListenerDidAdd(this, listener, thisArgs);
				}

				let result: IDisposable;
				result = {
					dispose: () => {
						
						result.dispose = Emitter._noop;
						if (!this._disposed) {
							remove();
							if (this._options && this._options.onLastListenerRemove) {
								const hasListeners = (this._listeners && !this._listeners.isEmpty());
								if (!hasListeners) {
									this._options.onLastListenerRemove(this);
								}
							}
						}
					}
				};
				if (disposables instanceof DisposableStore) {
					disposables.add(result);
				} else if (Array.isArray(disposables)) {
					disposables.push(result);
				}

				return result;
			};
		}
		return this._event;
	}

	/**
	 * To be kept private to fire an event to
	 * subscribers
	 */
	fire(event: T): void {
		if (this._listeners) {
			// put all [listener,event]-pairs into delivery queue
			// then emit all event. an inner/nested event might be
			// the driver of this

			if (!this._deliveryQueue) {
				this._deliveryQueue = new LinkedList();
			}

			for (let listener of this._listeners) {
				this._deliveryQueue.push([listener, event]);
			}

			while (this._deliveryQueue.size > 0) {
				const [listener, event] = this._deliveryQueue.shift()!;
				try {
					if (typeof listener === 'function') {
						listener.call(undefined, event);
					} else {
						listener[0].call(listener[1], event);
					}
				} catch (e) {
					console.log("ERR: " + e);   
				}
			}

		}
	}

	dispose() {
		this._listeners?.clear();
		this._deliveryQueue?.clear();
		this._disposed = true;
	}
}
