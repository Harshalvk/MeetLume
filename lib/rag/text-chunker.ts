export function chunkTranscript(transcript: string) {
  const maxChunksSize = 500;
  const chunks = [];

  const speakerLines = transcript.split("\n").filter((line) => line.trim());

  let currentChunk = "";
  let chunkIndex = 0;

  for (const line of speakerLines) {
    if (
      currentChunk.length + line.length > maxChunksSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.trim(),
        chunkIndex: chunkIndex,
      });
      chunkIndex++;
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex,
    });
  }

  return chunks;
}

export function extractSpeaker(text: string) {
  const match = text.match(/^([A-Za-z\s]+):\s*/);
  return match ? match[1].trim() : null;
}
