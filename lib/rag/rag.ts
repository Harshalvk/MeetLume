import { prisma } from "../prisma";
import { chatWithAI, createEmbedding, createManyEmbedding } from "./openai";
import { saveManyVectors, searchVector } from "./pinecone";
import { chunkTranscript, extractSpeaker } from "./text-chunker";

export async function processTranscript(
  meetingId: string,
  userId: string,
  transcript: string,
  meetingTitle?: string
) {
  const chunks = chunkTranscript(transcript);

  const texts = chunks.map((chunk) => chunk.content);

  const embeddings = await createManyEmbedding(texts);

  const dbChunks = chunks.map((chunk) => ({
    meetingId,
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    speakerName: extractSpeaker(chunk.content),
    vectorId: `${meetingId}_chunk_${chunk.chunkIndex}`,
  }));

  await prisma.transcriptChunk.createMany({
    data: dbChunks,
    skipDuplicates: true,
  });

  const vectors = chunks.map((chunk, index) => ({
    id: `${meetingId}_chunk_${chunk.chunkIndex}`,
    embedding: embeddings[index],
    metadata: {
      meetingId,
      userId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      speaker: extractSpeaker(chunk.content) ?? "Unknown",
      meetingTitle: meetingTitle || "Untitled Meeting",
    },
  }));

  await saveManyVectors(vectors);
}

export async function chatWithMeeting(
  userId: string,
  meetingId: string,
  question: string
) {
  const questionEmbedding = await createEmbedding(question);

  const results = await searchVector(
    questionEmbedding,
    {
      userId,
      meetingId,
    },
    5
  );

  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
  });

  const context = results
    .map((result) => {
      const speaker = result.metadata?.speakerName || "Unknown";
      const content = result.metadata?.content || "";
      return `${speaker}: ${content}`;
    })
    .join("\n\n");

  const systemPrompt = `You are helping someone understand their meeting.
    Meeting: ${meeting?.title || "Untitled Meeting"} 
    Date: ${meeting?.createdAt ? new Date(meeting.createdAt).toLocaleString() : "Unknown"}
    
    Here's what was discussed:
    ${context}
    
    Answer the user's question based only on the meeting content above. If the answer isn't in the meeting, say no`;

  const answer = await chatWithAI(systemPrompt, question);

  return {
    answer,
    sources: results.map((result) => ({
      meetingId: result.metadata?.meetingId,
      content: result.metadata?.content,
      speakerName: result.metadata?.speakerName,
      confidence: result.score,
    })),
  };
}

export async function chatWithAllMeetings(userId: string, question: string) {
  const questionEmbedding = await createEmbedding(question);

  const results = await searchVector(questionEmbedding, { userId }, 5);

  const context = results
    .map((result) => {
      const meetingTitle = result.metadata?.meetingTitle || "Untitled Meeting";
      const speaker = result.metadata?.speakerName || "Unknown";
      const content = result.metadata?.content || "";
      return `Meeting: ${meetingTitle}\n${speaker}: ${content}`;
    })
    .join("\n\n--\n\n");

  const systemPrompt = `You are helping someone understand their meeting history.
    
    Here's what was discussed across their meetings:
    ${context}
    
    Answer the user's question based only on the meeting content above. When you reference something, mention which meetings its from.`;

  const answer = await chatWithAI(systemPrompt, question);

  return {
    answer,
    sources: results.map((result) => ({
      meetingId: result.metadata?.meetingId,
      meetingTitle: result.metadata?.meetingTitle,
      content: result.metadata?.content,
      speakerName: result.metadata?.speakerName,
      confidence: result.score,
    })),
  };
}
