// src/lib/srtParser.ts

export interface Subtitle {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

// Convert SRT timestamp "00:01:23,450" or "00:01:23.450" to seconds (83.450)
function timeToSeconds(timeString: string): number {
  const parts = timeString.split(/[,.]/);
  const [hours, minutes, seconds] = parts[0].split(':').map(Number);
  const milliseconds = parts.length > 1 ? Number(parts[1]) : 0;
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseSrt(srtContent: string): Subtitle[] {
  // Normalize line endings
  const normalizedSrt = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double newlines or more to get blocks
  const blocks = normalizedSrt.split(/\n{2,}/);
  
  const rawSubs: Subtitle[] = [];
  let fallbackId = 1;

  for (const block of blocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let timeMatchIndex = -1;
    let timeMatch = null;
    
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/(\d{2}:\d{2}:\d{2}(?:[,.]\d+)?)\s*-->\s*(\d{2}:\d{2}:\d{2}(?:[,.]\d+)?)/);
        if (match) {
            timeMatch = match;
            timeMatchIndex = i;
            break;
        }
    }

    if (timeMatch && timeMatchIndex !== -1) {
        let startTime = timeToSeconds(timeMatch[1]);
        let endTime = timeToSeconds(timeMatch[2]);
        
        // AUTO-FIX: Swap if start > end (broken TTS export)
        if (startTime > endTime) {
          const tmp = startTime;
          startTime = endTime;
          endTime = tmp;
        }
        
        const text = lines.slice(timeMatchIndex + 1).join(' ').trim();
        
        let id = fallbackId;
        if (timeMatchIndex > 0) {
           const parsedId = parseInt(lines[timeMatchIndex - 1], 10);
           if (!isNaN(parsedId)) id = parsedId;
        }
        
        if (text) {
           rawSubs.push({ id, startTime, endTime, text });
        }
        fallbackId++;
    }
  }

  // AUTO-FIX: Sort by startTime to handle non-monotonic order
  rawSubs.sort((a, b) => a.startTime - b.startTime);

  // AUTO-FIX: Forcefully clamp each subtitle's endTime to the next one's startTime
  // This physically eliminates BOTH "gaps" (text disappearing) AND "overlaps" (wrong text staying on screen)
  const fixed: Subtitle[] = rawSubs.map((sub, i) => {
    const nextStart = rawSubs[i + 1]?.startTime;
    return {
      ...sub,
      endTime: nextStart !== undefined ? nextStart : sub.endTime,
    };
  });

  return fixed;
}
