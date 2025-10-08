import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

export async function saveManyVectors(
  vectors: Array<{
    id: string;
    embedding: number[] | undefined;
    metadata: Record<string, string | number | boolean>;
  }>
) {
  const upsertData = vectors.map((v) => ({
    id: v.id,
    values: v.embedding,
    metadata: v.metadata,
  }));

  await index.upsert(upsertData);
}

export async function searchVector(
  embeddings: number[],
  filter: Record<string, string | number | boolean> = {},
  topK: number = 5
) {
  const result = await index.query({
    vector: embeddings,
    filter,
    topK,
    includeMetadata: true,
  });

  return result.matches || [];
}
