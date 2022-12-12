import {
  SmartContract,
  state,
  State,
  method,
  Character,
  CircuitString,
  Poseidon,
  Field,
  Circuit,
  DeployArgs,
  Permissions,
  Bool,
  PublicKey,
  UInt64,
  AccountUpdate,
} from 'snarkyjs';

export class WordyContract extends SmartContract {
  @state(Field) wordHash = State<Field>();
  @state(Character) firstChar = State<Character>();
  @state(Character) lastChar = State<Character>();
  @state(Field) bank = State<Field>();
  @state(Bool) isSolved = State<Bool>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
      send: Permissions.proofOrSignature(),
      incrementNonce: Permissions.proofOrSignature(),
    });
    this.isSolved.set(Bool(true));
    this.bank.set(Field(0));
  }

  @method setWord(
    word: CircuitString,
    firstChar: Character,
    lastChar: Character
  ) {
    const isSolved = this.isSolved.get();
    this.isSolved.assertEquals(isSolved);
    isSolved.assertTrue();

    this.wordHash.set(Poseidon.hash(word.toFields()));
    this.firstChar.set(firstChar);
    this.lastChar.set(lastChar);
    this.isSolved.set(Bool(false));
  }

  @method guess(word: CircuitString, user: PublicKey) {
    const wordHash = this.wordHash.get();
    this.wordHash.assertEquals(wordHash);

    const bank = this.bank.get();
    this.bank.assertEquals(bank);

    const isSolved = this.isSolved.get();
    this.isSolved.assertEquals(isSolved);
    isSolved.assertFalse();

    // check solution
    const guessWordHash = Poseidon.hash(word.toFields());
    const isSolvedNew = guessWordHash.equals(wordHash);
    this.isSolved.set(isSolvedNew);

    // update bank
    const bankUpdated = Circuit.if(
      isSolvedNew,
      (() => Field(0))(),
      (() => bank.add(1))()
    );
    this.bank.set(bankUpdated);

    // if not solved - send tokens to contract
    const receiveAmount = Circuit.if(
      isSolvedNew,
      (() => Field(0))(),
      (() => Field(1100000000))()
    );
    const payerUpdate = AccountUpdate.create(user);
    payerUpdate.send({ to: this.address, amount: UInt64.from(receiveAmount) });
    payerUpdate.requireSignature();

    // if solved - send tokens to user
    const sendAmount = Circuit.if(
      isSolvedNew,
      (() => bank.mul(1000000000))(),
      (() => Field(0))()
    );
    this.send({ to: user, amount: UInt64.from(sendAmount) });
  }

  @method guessWithoutTokenTransactions(word: CircuitString) {
    const wordHash = this.wordHash.get();
    this.wordHash.assertEquals(wordHash);

    const bank = this.bank.get();
    this.bank.assertEquals(bank);

    const isSolved = this.isSolved.get();
    this.isSolved.assertEquals(isSolved);

    // check solution
    const guessWordHash = Poseidon.hash(word.toFields());
    const isSolvedNew = guessWordHash.equals(wordHash);
    this.isSolved.set(isSolvedNew);

    // update bank
    const bankUpdated = Circuit.if(
      isSolvedNew,
      (() => Field(0))(),
      (() => bank.add(1))()
    );
    this.bank.set(bankUpdated);
  }
}
