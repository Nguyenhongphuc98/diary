import { BaseService } from "../services/base/service";

// @AutoManage()
// class A {
// 	constructor(public readonly a: number) {
// 		console.log("inconstructor");

// 	}
// }

// const t = new A(7);
// console.log(t.a);

// class A {
// 	constructor() {
// 		setImmediate(() => {
// 			console.log("imediate");
// 		});
// 		console.log("constructor");
// 	}
// }

// const a = new A();

// container.register("a", {
// 	useFactory: predicateAwareClassFactory(c => true, MainLifecycleService, MainLifecycleService)
// })

const t = (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
  
    descriptor.value = function (...args) {
     
      const result = originalMethod.apply(this, args);

      console.log(`Execution time: milliseconds`);
      return result;
    };
  
    return descriptor;
  };

  function ClassWrapper(target: any) {
        // save a reference to the original constructor
        var original = target;

        // the new constructor behaviour
        var f: any = function (...args) {
            console.log('ClassWrapper: before class constructor', original.name);
           // let instance = original.apply(this, args)
            let instance = new original(args);
            console.log('ClassWrapper: after class constructor', original.name);
            return instance;
        }

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    };


  @ClassWrapper
  class Rocket {

    constructor() {
        console.log("construcotr");
        
    }

    @t
    launch() {
      console.log("Launching in 3... 2... 1... 🚀");
    }
  }
  

const rocket = new Rocket();
rocket.launch();

class A {
	constructor() {
		this.out();
	}

	out() {
		console.log("A");
	}
}

class B extends A {
	constructor() {
		super();
	}

	out() {
		console.log("B");
	}
}

const tt = new B();
tt.out();