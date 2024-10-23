import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function getEmbeddings(text: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }); // Adjust the model ID as necessary

        const result = await model.embedContent(text.replace(/\n/g, ' ')); // Preprocess the input text (removing newlines)

        return result.embedding;
    } catch (error) {
        console.error('Error calling Gemini embeddings API', error);
        throw error;
    }
}
