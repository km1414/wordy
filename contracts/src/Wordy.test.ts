import { WordyContract } from './Wordy';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Character,
  CircuitString,
  Bool,
} from 'snarkyjs';

let proofsEnabled = false;

describe('Add', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: WordyContract;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) WordyContract.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0].privateKey;
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new WordyContract(zkAppAddress);
  });

  afterAll(() => {
    setTimeout(shutdown, 0);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({ zkappKey: zkAppPrivateKey });
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Wordy` smart contract', async () => {
    await localDeploy();
    const bank = zkApp.bank.get();
    expect(bank).toEqual(Field(0));

    const isSolved = zkApp.isSolved.get();
    expect(isSolved).toEqual(Bool(true));
  });

  it('correctly executes `setWord()` on the `Wordy` smart contract', async () => {
    await localDeploy();
    const w = 'wordy';

    // set hidden word
    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.setWord(
        CircuitString.fromString(w),
        Character.fromString(w[0]),
        Character.fromString(w[w.length - 1])
      );
    });
    await txn.prove();
    await txn.send();

    const wordHash = zkApp.wordHash.get();
    expect(wordHash).toEqual(
      Field.fromJSON(
        '27059723360524324342648126972052566659652529680491188179651685791407047395223'
      )
    );

    const firstChar = zkApp.firstChar.get();
    expect(firstChar).toEqual(Character.fromString(w[0]));

    const lastChar = zkApp.lastChar.get();
    expect(lastChar).toEqual(Character.fromString(w[w.length - 1]));
  });

  it('correctly executes `guess()` on the `Wordy` smart contract', async () => {
    await localDeploy();
    const w = 'wordy';

    // set hidden word
    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.setWord(
        CircuitString.fromString(w),
        Character.fromString(w[0]),
        Character.fromString(w[w.length - 1])
      );
    });
    await txn.prove();
    await txn.send();

    // make a guess - incorrect
    const txn2 = await Mina.transaction(deployerAccount, () => {
      zkApp.guess(
        CircuitString.fromString('morty'),
        deployerAccount.toPublicKey()
      );
    });
    await txn2.prove();
    txn2.sign([deployerAccount]);
    await txn2.send();

    const bankAfterTxn2 = zkApp.bank.get();
    expect(bankAfterTxn2).toEqual(Field(1));

    const isSolvedAfterTxn2 = zkApp.isSolved.get();
    expect(isSolvedAfterTxn2).toEqual(Bool(false));

    // make a guess - correct
    const txn3 = await Mina.transaction(deployerAccount, () => {
      zkApp.guess(CircuitString.fromString(w), deployerAccount.toPublicKey());
    });
    await txn3.prove();
    txn3.sign([deployerAccount]);
    await txn3.send();

    const bankAfterTxn3 = zkApp.bank.get();
    expect(bankAfterTxn3).toEqual(Field(0));

    const isSolvedAfterTxn3 = zkApp.isSolved.get();
    expect(isSolvedAfterTxn3).toEqual(Bool(true));
  });
});
