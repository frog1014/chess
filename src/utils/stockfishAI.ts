// utils/stockfishAI.ts - API 版，零依賴

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
    // API 版不需要初始化
    console.log('[Stockfish] API mode ready ✅');
}

export async function requestAIMove(
  fen: string,
  depth = 10,
  onMove: (move: AIMove) => void,
) {
    console.log('[Stockfish] requesting move for FEN:', fen);

    try {
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`;
        const res = await fetch(url);
        const data = await res.json();

        console.log('[Stockfish] response:', data);

        if (data.success && data.bestmove) {
            // bestmove 格式是 "bestmove e2e4" 或直接 "e2e4"
            const raw: string = data.bestmove;
            const moveStr = raw.startsWith('bestmove')
                ? raw.split(' ')[1]
                : raw;

          console.log('[Stockfish] bestmove:', moveStr);
      onMove(parseUciMove(moveStr));
    }
    } catch (e) {
        console.error('[Stockfish] API error:', e);
    }
}

export function stopStockfish() {
    // API 版不需要 stop
}