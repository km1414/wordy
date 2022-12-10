/**
 * This script can be used to interact with the Add contract, after deploying it.
 *
 * We call the update() method on the contract, create a proof and send it to the chain.
 * The endpoint that we interact with is read from your config.json.
 *
 * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
 * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
 * would send the transaction and pay the fee.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js <network>`.
 */
import {
  Character,
  CircuitString,
  Mina,
  PrivateKey,
  shutdown,
  fetchAccount,
  UInt64,
} from 'snarkyjs';
import fs from 'fs/promises';
import { WordyContract } from './Wordy.js';

const word = 'wordy';
const fee = 100000000;

(async function main() {
  let network = process.argv[2];

  // parse config and private key from file
  type Config = { networks: Record<string, { url: string; keyPath: string }> };
  let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));

  // app keys
  let config = configJson.networks[network];
  let key: { privateKey: string } = JSON.parse(
    await fs.readFile(config.keyPath, 'utf8')
  );
  let zkAppPrivateKey = PrivateKey.fromBase58(key.privateKey);
  let zkAppAddress = zkAppPrivateKey.toPublicKey();

  // admin user keys
  let configAdmin = configJson.networks['admin'];
  let keyAdmin: { privateKey: string } = JSON.parse(
    await fs.readFile(configAdmin.keyPath, 'utf8')
  );
  let userPrivateKey = PrivateKey.fromBase58(keyAdmin.privateKey);
  // let userAddress = userPrivateKey.toPublicKey();

  // set up Mina instance and contract we interact with
  const Network = Mina.Network(config.url);
  Mina.setActiveInstance(Network);

  // compile the contract to create prover keys
  console.log('compile the contract...');
  await WordyContract.compile();

  console.log('try fetch zkapp account');
  let { account, error } = await fetchAccount({ publicKey: zkAppAddress });
  if (error) {
    console.log('error', JSON.stringify(error, null, 2));
    console.log('account', JSON.stringify(account, null, 2));
  }

  let zkapp = new WordyContract(zkAppAddress);

  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { feePayerKey: userPrivateKey, fee: UInt64.from(fee) },
    () => {
      zkapp.setWord(
        CircuitString.fromString(word),
        Character.fromString(word[0]),
        Character.fromString(word[word.length - 1])
      );
    }
  );
  await tx.prove();

  console.log('send transaction...');
  let sentTx = await tx.send();
  if (sentTx.hash() !== undefined) {
    console.log(`Success! Update transaction sent.`);
  }

  console.log('Shutting down');
  await shutdown();
})();
