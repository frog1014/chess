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
    console.log('[usePvC] useEffect init called'); // 確認 hook 有掛上去
    initStockfish(skillLevel)
    return () => { stopStockfish(); };
  }, []);

  useEffect(() => {
    if (!isPvC || currentTurn !== COLORS.BLACK) return;

    const fen = boardToFen(board, currentTurn);
    console.log('[usePvC] AI turn, FEN:', fen);

    // ✅ requestAIMove 現在是 async
    requestAIMove(fen, depth, (move) => {
      console.log('[usePvC] AI move:', move);
      onAIMoveRef.current(move.from, move.to);
    });
  }, [currentTurn, isPvC]);
}