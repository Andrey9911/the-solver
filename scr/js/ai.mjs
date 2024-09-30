import OpenAI from "openai";

export default async function openAI(promt)
{
    const openai = new OpenAI({

        apiKey: process.env.OPENAI_API_KEY,
    });


    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: promt }],
        model: "gpt-4o-mini",
    });
    return chatCompletion.choices[0].message;
}


// module.exports.OpenAI = chatCompletion;