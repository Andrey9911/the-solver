import { KeyPair, mnemonicNew,mnemonicToPrivateKey,sign  } from '@ton/crypto';
import { beginCell, Cell } from '@ton/core';
import { TonClient, WalletContractV4 } from "@ton/ton";
import { env } from 'process';

let my_wallet: Wallet;
let mnemonic: string[];
let keyPair:KeyPair;

const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v3/doc.json",
    apiKey: env.TONCENTER_API_KEY || "your-toncenter-api-key"
});

        // 3. Инициализация кошелька
let wallet: WalletContractV4;

export async function initializateWallet(key_string?: string) {
    mnemonic = (key_string ?? 'MNEMONIC_WORDS').split(' ');
    keyPair = await mnemonicToPrivateKey(mnemonic);
    console.log("Public key:", Buffer.from(keyPair.publicKey).toString('hex'));
    wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    my_wallet = new Wallet(keyPair, client);
    return my_wallet;
}

class Wallet {
    keyPair: { publicKey: Uint8Array; secretKey: Uint8Array };
    wallet: TonClient;
    constructor(keyPair: { publicKey: Uint8Array; secretKey: Uint8Array },wallet: TonClient) {
        this.keyPair = keyPair;
        this.wallet = client;
    }
// Build signed data (example: wallet message)
public buildSignedData() {
    const seqno = 5;
    const validUntil = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now

    const signedData = beginCell()
        .storeUint(seqno, 32)
        .storeUint(validUntil, 32)
        // ... other fields (subwallet_id, actions, etc.)
        .endCell();
    const dataToSign = sign(signedData.hash(), keyPair.secretKey);
    const messageBodySeparate = beginCell()
    .storeBuffer(dataToSign)             // 512 bits
    .storeRef(signedData)               // Signed data as cell
    .endCell();
}


    public async getWalletAddress(): Promise<string> {
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


// Read from environment; do not inline secrets
}

