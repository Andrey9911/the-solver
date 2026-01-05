import fetch from "node-fetch";

// const TONAPI_KEY = "YOUR_TONAPI_KEY";      // вставь свой API ключ TonAPI (бесплатный)
// const JETTON_MASTER = "EQD...";            // адрес jetton master (контракта токена)

// Получение списка холдеров
export async function getHolders(address_token, key) {
    if(!isTonAddress(address_token)){
        return {
            error:true,
            dates:null
        }
    }
    const url = `https://tonapi.io/v2/jettons/${address_token}/holders?limit=5&offset=0`;
    const token = await convertProcent(address_token,null,key)

    let data_procent = new Map();
    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${key}`,
            "Accept": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`TonAPI error: ${res}`);
    }
    const data = await res.json()
    
    let token_supply = new Number(token.total_supply);
        
        // console.log(token);
        
    //    console.log(`total supply - ${token_supply}`)
    for(let i=0;i<5;i++){
        data_procent.set(data.addresses[i].owner.address, ((Number(data.addresses[i].balance)/token_supply)*100).toFixed(2))
    }
    
    // console.log(data_procent);
    
    
    return {
        error:false,
        dates:data,
        top_wallets:data_procent
    }; 
}
async function convertProcent(address_token,account,key){
    const url = `https://tonapi.io/v2/jettons/${address_token}?limit=10&offset=10`;
    // console.log(`address token = ${address_token}`);
    
    const res =  await fetch(url, {
        headers: {
            "Authorization": `Bearer ${key}`,
            "Accept": "application/json"
        }
        
    })
    // .then((r)=> r.json()).then((resukt)=>{console.log(resukt);})
    if (!res.ok) {
        throw new Error(res.json());
    }
    const data = await res.json();
    // console.log(data);
    
    return data
}
function isTonAddress(address) {
    return typeof address === "string" && address.startsWith("EQ");
}

export function processing(promt){
    
}


// module.exports.OpenAI = chatCompletion;