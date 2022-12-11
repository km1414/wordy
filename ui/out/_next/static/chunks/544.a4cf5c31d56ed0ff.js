"use strict";
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[544],{

/***/ 6544:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "WordyContract": function() { return /* reexport */ WordyContract; }
});

// EXTERNAL MODULE: ./node_modules/snarkyjs/dist/web/index.js
var web = __webpack_require__(6400);
;// CONCATENATED MODULE: ../contracts/build/src/Wordy.js
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class WordyContract extends web/* SmartContract */.C3 {
    constructor() {
        super(...arguments);
        this.wordHash = (0,web/* State */.ZM)();
        this.firstChar = (0,web/* State */.ZM)();
        this.lastChar = (0,web/* State */.ZM)();
        this.bank = (0,web/* State */.ZM)();
        this.isSolved = (0,web/* State */.ZM)();
    }
    deploy(args) {
        super.deploy(args);
        this.setPermissions({
            ...web/* Permissions.default */.Pl["default"](),
            editState: web/* Permissions.proofOrSignature */.Pl.proofOrSignature(),
            send: web/* Permissions.proofOrSignature */.Pl.proofOrSignature(),
            incrementNonce: web/* Permissions.proofOrSignature */.Pl.proofOrSignature(),
        });
        this.isSolved.set((0,web/* Bool */.tW)(true));
        this.bank.set((0,web/* Field */.gN)(0));
    }
    setWord(word, firstChar, lastChar) {
        const isSolved = this.isSolved.get();
        this.isSolved.assertEquals(isSolved);
        isSolved.assertTrue();
        this.wordHash.set(web/* Poseidon.hash */.jm.hash(word.toFields()));
        this.firstChar.set(firstChar);
        this.lastChar.set(lastChar);
        this.isSolved.set((0,web/* Bool */.tW)(false));
    }
    guess(word, user) {
        const wordHash = this.wordHash.get();
        this.wordHash.assertEquals(wordHash);
        const bank = this.bank.get();
        this.bank.assertEquals(bank);
        const isSolved = this.isSolved.get();
        this.isSolved.assertEquals(isSolved);
        isSolved.assertFalse();
        // check solution
        const guessWordHash = web/* Poseidon.hash */.jm.hash(word.toFields());
        const isSolvedNew = guessWordHash.equals(wordHash);
        this.isSolved.set(isSolvedNew);
        // update bank
        const bankUpdated = web/* Circuit.if */.dx["if"](isSolvedNew, (() => (0,web/* Field */.gN)(0))(), (() => bank.add(1))());
        this.bank.set(bankUpdated);
        // if solved - send tokens to user
        const receiveAmount = web/* Circuit.if */.dx["if"](isSolvedNew, (() => (0,web/* Field */.gN)(0))(), (() => (0,web/* Field */.gN)(1100000000))());
        const payerUpdate = web/* AccountUpdate.create */.nx.create(user);
        payerUpdate.send({ to: this.address, amount: web/* UInt64.from */.zM.from(receiveAmount) });
        payerUpdate.requireSignature();
        // if not solved - send tokens to contract
        const sendAmount = web/* Circuit.if */.dx["if"](isSolvedNew, (() => bank.mul(1000000000))(), (() => (0,web/* Field */.gN)(0))());
        this.send({ to: user, amount: web/* UInt64.from */.zM.from(sendAmount) });
    }
    guessWithoutTokenTransactions(word) {
        const wordHash = this.wordHash.get();
        this.wordHash.assertEquals(wordHash);
        const bank = this.bank.get();
        this.bank.assertEquals(bank);
        const isSolved = this.isSolved.get();
        this.isSolved.assertEquals(isSolved);
        // check solution
        const guessWordHash = web/* Poseidon.hash */.jm.hash(word.toFields());
        const isSolvedNew = guessWordHash.equals(wordHash);
        this.isSolved.set(isSolvedNew);
        // update bank
        const bankUpdated = web/* Circuit.if */.dx["if"](isSolvedNew, (() => (0,web/* Field */.gN)(0))(), (() => bank.add(1))());
        this.bank.set(bankUpdated);
    }
}
__decorate([
    (0,web/* state */.SB)(web/* Field */.gN),
    __metadata("design:type", Object)
], WordyContract.prototype, "wordHash", void 0);
__decorate([
    (0,web/* state */.SB)(web/* Character */.zk),
    __metadata("design:type", Object)
], WordyContract.prototype, "firstChar", void 0);
__decorate([
    (0,web/* state */.SB)(web/* Character */.zk),
    __metadata("design:type", Object)
], WordyContract.prototype, "lastChar", void 0);
__decorate([
    (0,web/* state */.SB)(web/* Field */.gN),
    __metadata("design:type", Object)
], WordyContract.prototype, "bank", void 0);
__decorate([
    (0,web/* state */.SB)(web/* Bool */.tW),
    __metadata("design:type", Object)
], WordyContract.prototype, "isSolved", void 0);
__decorate([
    web/* method */.UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [web/* CircuitString */._G,
        web/* Character */.zk,
        web/* Character */.zk]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "setWord", null);
__decorate([
    web/* method */.UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [web/* CircuitString */._G, web/* PublicKey */.nh]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "guess", null);
__decorate([
    web/* method */.UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [web/* CircuitString */._G]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "guessWithoutTokenTransactions", null);
//# sourceMappingURL=Wordy.js.map
;// CONCATENATED MODULE: ../contracts/build/src/index.js


//# sourceMappingURL=index.js.map

/***/ })

}]);