import {initializateWallet} from '../../ts-compil/wallet.js';

let Wallet;
export async function connectTonWallet() {
    if(Wallet == undefined){
        Wallet = await initializateWallet('artefact math illegal differ menu differ unable giggle screen unveil divorce company gorilla skull tourist asthma magic cart peace solar sniff abandon acquire aware');
    }
}

export async function getWalletAddress() {
    if(Wallet == undefined) return await Wallet.getWalletAddress();
}