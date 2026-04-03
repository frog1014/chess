export type AIMove = {
  from: [number, number];
  to: [number, number];
};

const COL_MAP: Record<string, number> = {
  a: 0, b: 1, c: 2, d: 3,
  e: 4, f: 5, g: 6, h: 7,
};

function parseUciMove(uci: string): AIMove {
  return {
    from: [8 - parseInt(uci[1]), COL_MAP[uci[0]]],
    to:   [8 - parseInt(uci[3]), COL_MAP[uci[2]]],
  };
}

export function initStockfish(skillLevel = 10) {
  console.log('[Stockfish] API mode ready ✅');
}

// ✅ 單次請求，失敗時 throw
async function fetchBestMove(fen: string, depth: number): Promise<string> {
  const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.success || !data.bestmove) {
    throw new Error(`Invalid response: ${JSON.stringify(data)}`);
  }

  const raw: string = data.bestmove;
  return raw.startsWith('bestmove') ? raw.split(' ')[1] : raw;
}

export async function requestAIMove(
  fen: string,
  depth = 10,
  onMove: (move: AIMove) => void,
  maxRetries = 4,       // ✅ 最多重試次數
  retryDelayMs = 800,   // ✅ 每次重試間隔（ms）
) {
  console.log('[Stockfish] requesting move for FEN:', fen);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const moveStr = await fetchBestMove(fen, depth);
      console.log(`[Stockfish] bestmove (attempt ${attempt}):`, moveStr);
      onMove(parseUciMove(moveStr));
      return; // ✅ 成功就直接結束

    } catch (e) {
      console.warn(`[Stockfish] attempt ${attempt}/${maxRetries} failed:`, e);

      if (attempt < maxRetries) {
        // ✅ 等一段時間再重試
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      } else {
        console.error('[Stockfish] all retries exhausted, giving up.');
      }
    }
  }
}

export function stopStockfish() {
  // API 版不需要 stop
}