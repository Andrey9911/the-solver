"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializateWallet = initializateWallet;
const crypto_1 = require("@ton/crypto");
const core_1 = require("@ton/core");
const ton_1 = require("@ton/ton");
const process_1 = require("process");
let my_wallet;
let mnemonic;
let keyPair;
const client = new ton_1.TonClient({
    endpoint: "https://testnet.toncenter.com/api/v3/doc.json",
    apiKey: process_1.env.TONCENTER_API_KEY || "your-toncenter-api-key"
});
// 3. Инициализация кошелька
let wallet;
async function initializateWallet(key_string) {
    mnemonic = (key_string ?? 'MNEMONIC_WORDS').split(' ');
    keyPair = await (0, crypto_1.mnemonicToPrivateKey)(mnemonic);
    console.log("Public key:", Buffer.from(keyPair.publicKey).toString('hex'));
    wallet = ton_1.WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    my_wallet = new Wallet(keyPair, client);
    return my_wallet;
}
class Wallet {
    constructor(keyPair, wallet) {
        this.keyPair = keyPair;
        this.wallet = client;
    }
    // Build signed data (example: wallet message)
    buildSignedData() {
        const seqno = 5;
        const validUntil = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
        const signedData = (0, core_1.beginCell)()
            .storeUint(seqno, 32)
            .storeUint(validUntil, 32)
            // ... other fields (subwallet_id, actions, etc.)
            .endCell();
        const dataToSign = (0, crypto_1.sign)(signedData.hash(), keyPair.secretKey);
        const messageBodySeparate = (0, core_1.beginCell)()
            .storeBuffer(dataToSign) // 512 bits
            .storeRef(signedData) // Signed data as cell
            .endCell();
    }
    async getWalletAddress() {
        const walletAddress = wallet.address;
        console.log("Wallet address:", walletAddress.toString());
        return walletAddress.toString();
    }
    static async sendTonTransaction() {
        // const walletSender = wallet.sender(client, keyPair.secretKey);
        // const seqno = await client.getSeqno(wallet.address);
        // console.log("Current seqno =", seqno);
        // -----------------------------
        // 7. Отправка сообщения
        // -----------------------------
        // await client.sendExternalMessage();
        // console.log("Transaction sent!");
    }
}
