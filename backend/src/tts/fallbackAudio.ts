import fs from "node:fs";
import path from "node:path";

/**
 * Creates a valid PCM WAV audio file with silence for the requested duration.
 * Ensures the pipeline produces compliant audio files even in offline environments.
 */
export function createSilentWav(outputPath: string, durationSec: number): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sampleRate = 22050;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const numSamples = Math.floor(sampleRate * Math.max(0.5, durationSec));
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // "fmt " sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);          // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);           // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);  // SampleRate
  buffer.writeUInt32LE(byteRate, 28);    // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);  // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);// BitsPerSample

  // "data" sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Remainder of buffer is zeroed (pure silence)
  fs.writeFileSync(outputPath, buffer);
}

