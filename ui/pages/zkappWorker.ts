import {
  Mina,
  isReady,
  PublicKey,
  fetchAccount,
  CircuitString,
} from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import { WordyContract } from "../../contracts/src/Wordy";

const state = {
  WordyContract: null as null | typeof WordyContract,
  zkapp: null as null | WordyContract,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  loadSnarkyJS: async (args: {}) => {
    await isReady;
  },
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { WordyContract } = await import(
      "../../contracts/build/src/Wordy.js"
    );
    state.WordyContract = WordyContract;
  },
  compileContract: async (args: {}) => {
    await state.WordyContract!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.WordyContract!(publicKey);
  },
  getIsSolved: async (args: {}) => {
    const isSolved = await state.zkapp!.isSolved.get();
    return isSolved.toBoolean();
  },
  getBank: async (args: {}) => {
    const bank = await state.zkapp!.bank.get();
    return Number(bank.toString());
  },
  getFirstChar: async (args: {}) => {
    const firstChar = await state.zkapp!.firstChar.get();
    return firstChar.toString();
  },
  getLastChar: async (args: {}) => {
    const lastChar = await state.zkapp!.lastChar.get();
    return lastChar.toString();
  },
  createGuessTransaction: async (args: { word: string; user: PublicKey }) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.guessWithoutTokenTransactions(
        CircuitString.fromString(args.word)
      );
    });
    state.transaction = transaction;
  },
  proveGuessTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};
if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}
