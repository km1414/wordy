import { WordyContract } from './Wordy.js';
import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  AccountUpdate,
  Character,
  CircuitString,
} from 'snarkyjs';

let proofsEnabled = false;

(async function main() {
  await isReady;

  console.log('SnarkyJS loaded');

  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;

  if (proofsEnabled) {
    WordyContract.compile();
  }

  // ----------------------------------------------------

  // create a destination we will deploy the smart contract to
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  // create an instance of Wordy - and deploy it to zkAppAddress
  const zkAppInstance = new WordyContract(zkAppAddress);
  const deploy_txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
  });
  await deploy_txn.prove();
  // await deploy_txn.sign();
  await deploy_txn.sign([zkAppPrivateKey]);
  await deploy_txn.send();

  // get the initial state after deployment
  console.log(
    'state after init:',
    zkAppInstance.wordHash.get().toString(),
    zkAppInstance.firstChar.get().toString(),
    zkAppInstance.lastChar.get().toString(),
    zkAppInstance.bank.get().toString(),
    zkAppInstance.isSolved.get().toBoolean(),
    'zkapp tokens:' + Mina.getBalance(zkAppAddress).value.toBigInt().toString(),
    'user tokens:' +
      Mina.getBalance(deployerAccount.toPublicKey()).value.toBigInt().toString()
  );

  // ----------------------------------------------------
  const txn1 = await Mina.transaction(deployerAccount, () => {
    const word = 'wordy';
    zkAppInstance.setWord(
      CircuitString.fromString(word),
      Character.fromString(word[0]),
      Character.fromString(word[word.length - 1])
    );
  });
  await txn1.prove();
  await txn1.send();

  console.log(
    'state after txn1:',
    zkAppInstance.wordHash.get().toString(),
    zkAppInstance.firstChar.get().toString(),
    zkAppInstance.lastChar.get().toString(),
    zkAppInstance.bank.get().toString(),
    zkAppInstance.isSolved.get().toBoolean(),
    'zkapp tokens:' + Mina.getBalance(zkAppAddress).value.toBigInt().toString(),
    'user tokens:' +
      Mina.getBalance(deployerAccount.toPublicKey()).value.toBigInt().toString()
  );

  // ----------------------------------------------------

  const privateK = Local.testAccounts[1].privateKey;
  const publicK = Local.testAccounts[1].publicKey;

  const zkapp = new WordyContract(zkAppAddress);

  try {
    const txn2 = await Mina.transaction(privateK, () => {
      const word = 'horny';
      zkapp.guess(CircuitString.fromString(word), publicK);
    });
    await txn2.prove();
    await txn2.sign([privateK]);
    await txn2.send();
  } catch (e) {
    console.log('<<guess failed>>', e);
  }

  console.log(
    'state after txn2:',
    zkAppInstance.wordHash.get().toString(),
    zkAppInstance.firstChar.get().toString(),
    zkAppInstance.lastChar.get().toString(),
    zkAppInstance.bank.get().toString(),
    zkAppInstance.isSolved.get().toBoolean(),
    'zkapp tokens:' + Mina.getBalance(zkAppAddress).value.toBigInt().toString(),
    'user tokens:' +
      Mina.getBalance(deployerAccount.toPublicKey()).value.toBigInt().toString()
  );

  // ----------------------------------------------------

  try {
    const txn3 = await Mina.transaction(deployerAccount, () => {
      const word = 'windy';
      zkAppInstance.guess(
        CircuitString.fromString(word),
        deployerAccount.toPublicKey()
      );
    });
    await txn3.prove();
    await txn3.sign([deployerAccount]);
    await txn3.send();
  } catch (e) {
    console.log('<<guess failed>>', e);
  }

  console.log(
    'state after txn3:',
    zkAppInstance.wordHash.get().toString(),
    zkAppInstance.firstChar.get().toString(),
    zkAppInstance.lastChar.get().toString(),
    zkAppInstance.bank.get().toString(),
    zkAppInstance.isSolved.get().toBoolean(),
    'zkapp tokens:' + Mina.getBalance(zkAppAddress).value.toBigInt().toString(),
    'user tokens:' +
      Mina.getBalance(deployerAccount.toPublicKey()).value.toBigInt().toString()
  );

  // ----------------------------------------------------

  try {
    const txn4 = await Mina.transaction(deployerAccount, () => {
      const word = 'wordy';
      zkAppInstance.guess(
        CircuitString.fromString(word),
        deployerAccount.toPublicKey()
      );
    });
    await txn4.prove();
    await txn4.sign([deployerAccount]);
    await txn4.send();
  } catch (e) {
    console.log('<<guess failed>>', e);
  }

  console.log(
    'state after txn4:',
    zkAppInstance.wordHash.get().toString(),
    zkAppInstance.firstChar.get().toString(),
    zkAppInstance.lastChar.get().toString(),
    zkAppInstance.bank.get().toString(),
    zkAppInstance.isSolved.get().toBoolean(),
    'zkapp tokens:' + Mina.getBalance(zkAppAddress).value.toBigInt().toString(),
    'user tokens:' +
      Mina.getBalance(deployerAccount.toPublicKey()).value.toBigInt().toString()
  );

  console.log('Shutting down');

  await shutdown();
})();
