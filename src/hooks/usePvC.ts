import { useEffect, useRef } from 'react';
import { COLORS, boardToFen, type Board, type PieceColor } from '../utils/chessLogic';
import { initStockfish, requestAIMove, stopStockfish } from '../utils/stockfishAI';

interface UsePvCOptions {
  board: Board;
  currentTurn: PieceColor;
  isPvC: boolean;
  skillLevel?: number;
  depth?: number;
  onAIMove: (from: [number, number], to: [number, number]) => void;
}

export function usePvC({
  board, currentTurn, isPvC,
  skillLevel = 10, depth = 10, onAIMove,
}: UsePvCOptions) {
  const onAIMoveRef = useRef(onAIMove);
  useEffect(() => { onAIMoveRef.current = onAIMove; }, [onAIMove]);

  useEffect(() => {
    initStockfish(skillLevel);
    return () => { stopStockfish(); };
  }, []);

  useEffect(() => {
    if (!isPvC || currentTurn !== COLORS.BLACK) return;

    // ✅ 等 1 秒後才呼叫 API
    const timer = setTimeout(() => {
      const fen = boardToFen(board, currentTurn);
      console.log('[usePvC] AI turn, FEN:', fen);

      requestAIMove(fen, depth, (move) => {
        console.log('[usePvC] AI move received:', move);
        onAIMoveRef.current(move.from, move.to);
      });
    }, 1000);

    // 換手時清除，避免殘留
    return () => clearTimeout(timer);
  }, [currentTurn, isPvC]);
}