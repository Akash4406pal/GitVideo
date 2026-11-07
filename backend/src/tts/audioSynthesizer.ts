import fs from "node:fs";
import path from "node:path";
import type { Storyboard } from "../types/storyboard.js";
import { synthesizeSpeech } from "./edgeTtsClient.js";
import { getAudioDurationInSeconds } from "./audioDuration.js";
import { createSilentWav } from "./fallbackAudio.js";
import { sanitizeForSpeech } from "./speechSanitizer.js";

export interface AudioSynthesisResult {
  storyboard: Storyboard;
  totalAudioDurationSec: number;
  totalClipsGenerated: number;
}

export async function synthesizeStoryboardAudio(
  storyboard: Storyboard,
  outputAudioDir: string
): Promise<AudioSynthesisResult> {
  console.log(`\n----------------------------------------------`);
  console.log(`  Step 3: Voiceover & Audio Synthesis (TTS)`);
  console.log(`----------------------------------------------`);
  console.log(`[Audio Output Directory] ${outputAudioDir}`);

  let totalClips = 0;
  let totalVideoDuration = 0;

  for (const scene of storyboard.scenes) {
    let sceneAudioDuration = 0;

    for (const segment of scene.segments) {
      // Sanitize spoken text so TTS never says "underscore" or reads awkward syntax
      const cleanSpokenText = sanitizeForSpeech(segment.text);
      segment.text = cleanSpokenText;

      const fileName = `${scene.id}_${segment.id}.mp3`;
      const filePath = path.join(outputAudioDir, fileName);

      console.log(`🎙️  Synthesizing [${scene.id}/${segment.id}]: "${cleanSpokenText.substring(0, 50)}..."`);

      let durationSec = 2.5;

      try {
        await synthesizeSpeech(cleanSpokenText, filePath);
        durationSec = getAudioDurationInSeconds(filePath);
        segment.audioPath = filePath;
      } catch (err: any) {
        console.warn(`⚠️ Neural TTS failed (${err.message}). Using fallback audio.`);
        // Clean up 0-byte / failed MP3 file if created
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch {}

        const fallbackPath = filePath.replace(/\.mp3$/i, ".wav");
        const wordCount = segment.text.split(/\s+/).filter(Boolean).length;
        const estimatedSeconds = Math.max(2.0, Number((wordCount / 2.3).toFixed(2)));
        
        createSilentWav(fallbackPath, estimatedSeconds);
        durationSec = estimatedSeconds;
        segment.audioPath = fallbackPath;
      }

      segment.durationSec = durationSec;
      sceneAudioDuration += durationSec;
      totalClips++;

      console.log(`   ✔ Clip saved: ${path.basename(segment.audioPath)} (${durationSec}s)`);
    }

    // Update scene duration estimate to match real audio duration
    scene.durationEstimateSec = Number(sceneAudioDuration.toFixed(2));
    totalVideoDuration += sceneAudioDuration;
  }

  storyboard.estimatedDurationSec = Number(totalVideoDuration.toFixed(2));

  console.log(`\n✔ Audio Synthesis Complete:`);
  console.log(`   - Total Audio Clips: ${totalClips}`);
  console.log(`   - Total Exact Audio Duration: ${storyboard.estimatedDurationSec}s`);

  return {
    storyboard,
    totalAudioDurationSec: storyboard.estimatedDurationSec,
    totalClipsGenerated: totalClips,
  };
}

