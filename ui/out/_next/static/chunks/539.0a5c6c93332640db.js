"use strict";
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[539],{

/***/ 8539:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WordyContract": function() { return /* binding */ WordyContract; }
/* harmony export */ });
/* harmony import */ var snarkyjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6400);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class WordyContract extends snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .SmartContract */ .C3 {
    constructor() {
        super(...arguments);
        this.wordHash = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.firstChar = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.lastChar = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.bank = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
        this.isSolved = (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .State */ .ZM)();
    }
    deploy(args) {
        super.deploy(args);
        this.setPermissions({
            ...snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Permissions["default"] */ .Pl["default"](),
            editState: snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Permissions.proofOrSignature */ .Pl.proofOrSignature(),
            send: snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Permissions.proofOrSignature */ .Pl.proofOrSignature(),
            incrementNonce: snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Permissions.proofOrSignature */ .Pl.proofOrSignature(),
        });
        this.isSolved.set((0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true));
        this.bank.set((0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0));
    }
    setWord(word, firstChar, lastChar) {
        const isSolved = this.isSolved.get();
        this.isSolved.assertEquals(isSolved);
        isSolved.assertTrue();
        this.wordHash.set(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon.hash */ .jm.hash(word.toFields()));
        this.firstChar.set(firstChar);
        this.lastChar.set(lastChar);
        this.isSolved.set((0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(false));
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
        const guessWordHash = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon.hash */ .jm.hash(word.toFields());
        const isSolvedNew = guessWordHash.equals(wordHash);
        this.isSolved.set(isSolvedNew);
        // update bank
        const bankUpdated = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Circuit["if"] */ .dx["if"](isSolvedNew, (() => (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0))(), (() => bank.add(1))());
        this.bank.set(bankUpdated);
        // if not solved - send tokens to contract
        const receiveAmount = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Circuit["if"] */ .dx["if"](isSolvedNew, (() => (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0))(), (() => (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(1100000000))());
        const payerUpdate = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .AccountUpdate.create */ .nx.create(user);
        payerUpdate.send({ to: this.address, amount: snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .UInt64.from */ .zM.from(receiveAmount) });
        payerUpdate.requireSignature();
        // if solved - send tokens to user
        const sendAmount = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Circuit["if"] */ .dx["if"](isSolvedNew, (() => bank.mul(1000000000))(), (() => (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0))());
        this.send({ to: user, amount: snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .UInt64.from */ .zM.from(sendAmount) });
    }
    guessWithoutTokenTransactions(word) {
        const wordHash = this.wordHash.get();
        this.wordHash.assertEquals(wordHash);
        const bank = this.bank.get();
        this.bank.assertEquals(bank);
        const isSolved = this.isSolved.get();
        this.isSolved.assertEquals(isSolved);
        // check solution
        const guessWordHash = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Poseidon.hash */ .jm.hash(word.toFields());
        const isSolvedNew = guessWordHash.equals(wordHash);
        this.isSolved.set(isSolvedNew);
        // update bank
        const bankUpdated = snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Circuit["if"] */ .dx["if"](isSolvedNew, (() => (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0))(), (() => bank.add(1))());
        this.bank.set(bankUpdated);
    }
}
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], WordyContract.prototype, "wordHash", void 0);
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Character */ .zk),
    __metadata("design:type", Object)
], WordyContract.prototype, "firstChar", void 0);
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Character */ .zk),
    __metadata("design:type", Object)
], WordyContract.prototype, "lastChar", void 0);
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], WordyContract.prototype, "bank", void 0);
__decorate([
    (0,snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW),
    __metadata("design:type", Object)
], WordyContract.prototype, "isSolved", void 0);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .CircuitString */ ._G,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Character */ .zk,
        snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .Character */ .zk]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "setWord", null);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .CircuitString */ ._G, snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "guess", null);
__decorate([
    snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snarkyjs__WEBPACK_IMPORTED_MODULE_0__/* .CircuitString */ ._G]),
    __metadata("design:returntype", void 0)
], WordyContract.prototype, "guessWithoutTokenTransactions", null);
//# sourceMappingURL=Wordy.js.map

/***/ })

}]);