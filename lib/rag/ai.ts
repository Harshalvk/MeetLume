import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function createEmbedding(text: string) {
  try {
    const response = await gemini.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 512,
      },
    });

    const embedding = response?.embeddings?.[0]?.values ?? null;

    if (!embedding) {
      throw new Error("Embedding generation failed");
    }

    return embedding;
  } catch (error) {
    console.error("Create Embedding Error: ", error);
    return null;
  }
}

export async function createManyEmbedding(texts: string[]) {
  const response = await gemini.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts,
    config: {
      outputDimensionality: 512,
    },
  });
  return response?.embeddings?.map((item) => item.values);
}

export async function chatWithAI(systemPrompt: string, userQuestion: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: userQuestion,
          },
        ],
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  return (
    response?.candidates?.[0]?.content?.parts?.[0].text ||
    "Sorry, I could not generate a response."
  );
}
