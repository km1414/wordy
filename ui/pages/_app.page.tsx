import "../styles/globals.css";
import React from "react";
import { useEffect, useState } from "react";
import "./reactCOIServiceWorker";

import ZkappWorkerClient from "./zkappWorkerClient";

import { PublicKey } from "snarkyjs";

let transactionFee = 0.1;

export default function App() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
    isSolved: null as null | boolean,
    bank: null as null | number,
    firstChar: null as null | string,
    lastChar: null as null | string,
  });

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        const zkappWorkerClient = new ZkappWorkerClient();

        console.log("Loading SnarkyJS...");
        await zkappWorkerClient.loadSnarkyJS();
        console.log("done");

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log("using key", publicKey.toBase58());

        console.log("checking if account exists...");
        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });
        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        console.log("compiling zkApp");
        await zkappWorkerClient.compileContract();
        console.log("zkApp compiled");

        const zkappPublicKey = PublicKey.fromBase58(
          "B62qpC1fcMoaTxR9NG2hcej2LtabVPcXYVA54mzfrxikUWh8mKj5ftw"
        );

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log("getting zkApp state...");
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });

        const bank = await zkappWorkerClient.getBank();
        const isSolved = await zkappWorkerClient.getIsSolved();
        const firstChar = await zkappWorkerClient.getFirstChar();
        const lastChar = await zkappWorkerClient.getLastChar();

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          isSolved,
          bank,
          firstChar,
          lastChar,
        });
      }
    })();
  }, [state]);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          console.log("checking if account exists...");
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state]);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async (word: string) => {
    setState({ ...state, creatingTransaction: true });
    console.log("sending a transaction...");

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    console.log("making guess transaction...");
    await state.zkappWorkerClient!.createGuessTransaction(
      word,
      state.publicKey!
    );

    console.log("creating proof...");
    await state.zkappWorkerClient!.proveGuessTransaction();

    console.log("getting Transaction JSON...");
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    console.log("requesting send transaction...");
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });

    console.log(
      "See transaction at https://berkeley.minaexplorer.com/transaction/" + hash
    );

    setState({ ...state, creatingTransaction: false });
  };

  // -------------------------------------------------------
  // Refresh the current state

  const refreshStatus = async () => {
    console.log("getting zkApp state...");
    if (state.zkappWorkerClient!) {
      await state.zkappWorkerClient!.fetchAccount({
        publicKey: state.zkappPublicKey!,
      });
      const isSolved = await state.zkappWorkerClient!.getIsSolved();
      const bank = await state.zkappWorkerClient!.getBank();
      const firstChar = await state.zkappWorkerClient!.getFirstChar();
      const lastChar = await state.zkappWorkerClient!.getLastChar();

      setState({ ...state, isSolved, bank, firstChar, lastChar });
    }
  };

  // -------------------------------------------------------
  // Create UI elements

  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        {" "}
        [Link]{" "}
      </a>
    );
    hasWallet = (
      <div>
        {" "}
        Could not find a wallet. Install Auro wallet here: {auroLinkElem}
      </div>
    );
  }

  let setupText = state.hasBeenSetup
    ? "SnarkyJS Ready"
    : "Setting up SnarkyJS...";
  let setup = (
    <div>
      {" "}
      {setupText} {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      "https://faucet.minaprotocol.com/?address=" + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        Account does not exist. Please visit the faucet to fund this account
        <a href={faucetLink} target="_blank" rel="noreferrer">
          {" "}
          [Link]{" "}
        </a>
      </div>
    );
  }

  type squeresProps = { squares: string[] };
  function Board({ squares }: squeresProps) {
    const list = squares.map((s, i) => (
      <div key={i}>
        <Square value={s} />{" "}
      </div>
    ));
    return (
      <div>
        <div className="status"></div>
        <div className="board-row">{list}</div>
      </div>
    );
  }

  type SquareVal = { value: string };
  function Square({ value }: SquareVal) {
    return <button className="square">{value}</button>;
  }

  const [word, setWord] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const changedTitle = Math.random() > 0.1 ? "wordy" : "w***y";
      setTitle(changedTitle);
    }, 10);

    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div className="main-container">
        <div className="title">{title}</div>
        <br />
        <div>
          {" "}
          The goal of the{" "}
          <b>
            <i>wordy</i>
          </b>{" "}
          game - to guess the hidden word. Each answer submission costs 1.1 MINA
          (+ transaction fee) and increases the bank by 1 MINA. The winner takes
          the bank. Note: currently real token transactions are disabled, but
          will be live soon.
        </div>
        <br />
        <br />
        <div>
          Hidden word contain 5 letters, first and last of them are known. To
          submit your answer, type the full word in the field below, hit{" "}
          <b>Guess</b> and sign the transaction with AURO. Good luck!{" "}
        </div>
        <div>
          {" "}
          <Board
            squares={[state.firstChar!, "*", "*", "*", state.lastChar!]}
          />{" "}
        </div>
        <br />
        <input
          type="text"
          maxLength={5}
          value={word}
          onChange={(e) => setWord(e.target.value.toLowerCase())}
        />
        <br />
        <button
          onClick={() => onSendTransaction(word)}
          disabled={state.creatingTransaction}
        >
          {" "}
          Guess{" "}
        </button>
        <br />
        <div> Is solved: {state.isSolved!.toString()} </div>
        <div> Bank size: {state.bank!} MINA</div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <a
          href="https://berkeley.minaexplorer.com/wallet/B62qpC1fcMoaTxR9NG2hcej2LtabVPcXYVA54mzfrxikUWh8mKj5ftw"
          target="_blank"
          rel="noreferrer"
        >
          {" "}
          [Explorer]{" "}
        </a>
        <a
          href="https://github.com/km1414/wordy"
          target="_blank"
          rel="noreferrer"
        >
          {" "}
          [Github]{" "}
        </a>
      </div>
    );
  }

  return (
    <div>
      {setup}
      {accountDoesNotExist}
      {mainContent}
    </div>
  );
}
