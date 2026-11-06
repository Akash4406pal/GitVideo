import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const getMP3Duration = require("get-mp3-duration");

/**
 * Calculates audio duration in seconds for MP3 or WAV files.
 */
export function getAudioDurationInSeconds(filePath: string): number {
  try {
    if (!fs.existsSync(filePath)) {
      return 2.5;
    }

    const buffer = fs.readFileSync(filePath);

    // Check if it's a WAV file (starts with "RIFF")
    if (buffer.length > 44 && buffer.toString("ascii", 0, 4) === "RIFF") {
      const sampleRate = buffer.readUInt32LE(24);
      const byteRate = buffer.readUInt32LE(28);
      const dataSize = buffer.length - 44;
      if (byteRate > 0) {
        return Number((dataSize / byteRate).toFixed(2));
      }
    }

    // MP3 duration calculation via get-mp3-duration
    const durationMs = getMP3Duration(buffer);
    if (durationMs && typeof durationMs === "number" && durationMs > 0) {
      return Number((durationMs / 1000).toFixed(2));
    }

    // Fallback: estimate from file size assuming 96kbps MP3 (12,000 bytes/sec)
    const estimated = Math.max(1.0, buffer.length / 12000);
    return Number(estimated.toFixed(2));
  } catch (err) {
    return 2.5;
  }
}

