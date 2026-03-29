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
    initStockfish(skillLevel); // async，但不需要 await，背景初始化即可
    return () => { stopStockfish(); };
  }, []);

  useEffect(() => {
    if (!isPvC || currentTurn !== COLORS.BLACK) return;

    const fen = boardToFen(board, currentTurn);
    requestAIMove(fen, depth, (move) => {
      onAIMoveRef.current(move.from, move.to);
    });
  }, [currentTurn, isPvC]);
}