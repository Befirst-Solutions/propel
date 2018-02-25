
//import * as propel from "../src/api";
//import * as matplotlib from "../src/matplotlib";
//import * as mnist from "../src/mnist";

import { RpcChannel } from "./nb_rpc_channel";
import { transpile } from "./nb_transpiler";

// If you use the eval function indirectly, by invoking it via a reference
// other than eval, as of ECMAScript 5 it works in the global scope rather than
// the local scope. This means, for instance, that function declarations create
// global functions, and that the code being evaluated doesn't have access to
// local variables within the scope where it's being called.
const globalEval = eval;
const global = globalEval("this");

class Console {
  constructor(private rpc: RpcChannel, private cellId: number) { }

  private serialize(value): string {
    return JSON.stringify(value, null, 2);
  }

  private send(...args) {
    return this.rpc.call("console", this.cellId, ...args.map(this.serialize));
  }

  log(...args) {
    return this.send(...args);
  }

  warn(...args) {
    return this.send(...args);
  }

  error(...args) {
    return this.send(...args);
  }
}

async function importModule(target) {
  const m = {
    //matplotlib,
    //mnist,
    //propel,
  }[target];
  if (m) {
    return m;
  }
  throw new Error("Unknown module: " + target);
}

console.log("load");

const rpc = new RpcChannel(window.parent, {
  async evalCell(source: string, cellId: number): Promise<any> {
    source = transpile(source);
    source += `\n//# sourceURL=__cell${cellId}__.js`;
    const fn = globalEval(source);
    const console = new Console(rpc, cellId);
    return await fn(global, importModule, console);
  }
});
