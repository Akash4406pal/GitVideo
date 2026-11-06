import fs from "node:fs";
import path from "node:path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export interface TtsOptions {
  voice?: string;
  timeoutMs?: number;
}

export async function synthesizeSpeech(
  text: string,
  outputPath: string,
  options: TtsOptions = {}
): Promise<void> {
  const voice = options.voice || process.env.TTS_VOICE || "en-US-AndrewMultilingualNeural";
  const timeoutMs = options.timeoutMs || 25000;

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const tts = new MsEdgeTTS({ connectionTimeoutMs: 10000, synthesisTimeoutMs: timeoutMs });

  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    await new Promise<void>((resolve, reject) => {
      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try { tts.close(); } catch {}
          reject(new Error(`TTS synthesis timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      try {
        const { audioStream } = tts.toStream(text);
        const writeStream = fs.createWriteStream(outputPath);

        audioStream.pipe(writeStream);

        writeStream.on("finish", () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            resolve();
          }
        });

        audioStream.on("error", (err: unknown) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        });

        writeStream.on("error", (err: unknown) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        });
      } catch (err: unknown) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      }
    });
  } finally {
    try {
      tts.close();
    } catch {
      // ignore socket cleanup errors
    }
  }
}
