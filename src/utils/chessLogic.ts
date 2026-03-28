// 棋子類型
export const PIECE_TYPES = {
  PAWN: 'pawn',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king',
} as const;

// 棋子顏色
export const COLORS = {
  WHITE: 'white',
  BLACK: 'black',
} as const;

export type PieceType = (typeof PIECE_TYPES)[keyof typeof PIECE_TYPES];
export type PieceColor = (typeof COLORS)[keyof typeof COLORS];

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type BoardSquare = Piece | null;
export type Board = BoardSquare[][];

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  moveHistory: Array<{ from: [number, number]; to: [number, number] }>;
}

interface MoveCoord {
  row: number;
  col: number;
}

export type MoveResult =
  | { success: true; newGameState: GameState }
  | { success: false; error: string };

// 獲取棋子的 Unicode 符號
export function getPieceUnicode(type: PieceType, color: PieceColor): string {
  const pieces: Record<PieceColor, Record<PieceType, string>> = {
    white: {
      pawn: '♙',
      rook: '♖',
      knight: '♘',
      bishop: '♗',
      queen: '♕',
      king: '♔',
    },
    black: {
      pawn: '♟',
      rook: '♜',
      knight: '♞',
      bishop: '♝',
      queen: '♛',
      king: '♚',
    },
  };

  return pieces[color][type] ?? '';
}

// 初始化棋盤
function initializeBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array<BoardSquare>(8).fill(null));

  // 設置黑棋
  board[0][0] = { type: PIECE_TYPES.ROOK, color: COLORS.BLACK };
  board[0][1] = { type: PIECE_TYPES.KNIGHT, color: COLORS.BLACK };
  board[0][2] = { type: PIECE_TYPES.BISHOP, color: COLORS.BLACK };
  board[0][3] = { type: PIECE_TYPES.QUEEN, color: COLORS.BLACK };
  board[0][4] = { type: PIECE_TYPES.KING, color: COLORS.BLACK };
  board[0][5] = { type: PIECE_TYPES.BISHOP, color: COLORS.BLACK };
  board[0][6] = { type: PIECE_TYPES.KNIGHT, color: COLORS.BLACK };
  board[0][7] = { type: PIECE_TYPES.ROOK, color: COLORS.BLACK };

  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: PIECE_TYPES.PAWN, color: COLORS.BLACK };
  }

  // 設置白棋
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: PIECE_TYPES.PAWN, color: COLORS.WHITE };
  }

  board[7][0] = { type: PIECE_TYPES.ROOK, color: COLORS.WHITE };
  board[7][1] = { type: PIECE_TYPES.KNIGHT, color: COLORS.WHITE };
  board[7][2] = { type: PIECE_TYPES.BISHOP, color: COLORS.WHITE };
  board[7][3] = { type: PIECE_TYPES.QUEEN, color: COLORS.WHITE };
  board[7][4] = { type: PIECE_TYPES.KING, color: COLORS.WHITE };
  board[7][5] = { type: PIECE_TYPES.BISHOP, color: COLORS.WHITE };
  board[7][6] = { type: PIECE_TYPES.KNIGHT, color: COLORS.WHITE };
  board[7][7] = { type: PIECE_TYPES.ROOK, color: COLORS.WHITE };

  return board;
}

// 初始化遊戲狀態
export function initializeChessGame(): GameState {
  return {
    board: initializeBoard(),
    currentTurn: COLORS.WHITE,
    moveHistory: [],
  };
}

// 獲取合法的移動
function getLegalMoves(board: Board, row: number, col: number): MoveCoord[] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: MoveCoord[] = [];

  switch (piece.type) {
    case PIECE_TYPES.PAWN:
      moves.push(...getPawnMoves(board, row, col, piece.color));
      break;
    case PIECE_TYPES.ROOK:
      moves.push(...getRookMoves(board, row, col, piece.color));
      break;
    case PIECE_TYPES.KNIGHT:
      moves.push(...getKnightMoves(board, row, col, piece.color));
      break;
    case PIECE_TYPES.BISHOP:
      moves.push(...getBishopMoves(board, row, col, piece.color));
      break;
    case PIECE_TYPES.QUEEN:
      moves.push(...getQueenMoves(board, row, col, piece.color));
      break;
    case PIECE_TYPES.KING:
      moves.push(...getKingMoves(board, row, col, piece.color));
      break;
  }

  return moves;
}

/** 教學／提示：該格若有棋子，回傳目前盤勢下的所有合法走格（與 makeMove 使用的規則相同）。 */
export function getLegalMovesFromSquare(board: Board, row: number, col: number): MoveCoord[] {
  return getLegalMoves(board, row, col);
}

// 兵的移動
function getPawnMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  const moves: MoveCoord[] = [];
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;

  // 向前一步
  const nextRow = row + direction;
  if (nextRow >= 0 && nextRow < 8 && !board[nextRow][col]) {
    moves.push({ row: nextRow, col });

    // 從起始位置可以向前兩步
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // 吃子（對角線）
  for (const newCol of [col - 1, col + 1]) {
    if (nextRow >= 0 && nextRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[nextRow][newCol];
      if (targetPiece && targetPiece.color !== color) {
        moves.push({ row: nextRow, col: newCol });
      }
    }
  }

  return moves;
}

// 車的移動
function getRookMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  const moves: MoveCoord[] = [];
  const directions: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;

      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  }

  return moves;
}

// 馬的移動
function getKnightMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  const moves: MoveCoord[] = [];
  const offsets: [number, number][] = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

// 象的移動
function getBishopMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  const moves: MoveCoord[] = [];
  const directions: [number, number][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  for (const [dr, dc] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;

      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  }

  return moves;
}

// 后的移動
function getQueenMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
}

// 王的移動
function getKingMoves(board: Board, row: number, col: number, color: PieceColor): MoveCoord[] {
  const moves: MoveCoord[] = [];
  const offsets: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

// 執行移動
export function makeMove(
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): MoveResult {
  const piece = gameState.board[fromRow][fromCol];

  if (!piece || piece.color !== gameState.currentTurn) {
    return { success: false, error: '不是該棋子的行棋時間' };
  }

  const legalMoves = getLegalMoves(gameState.board, fromRow, fromCol);
  const isLegalMove = legalMoves.some((move) => move.row === toRow && move.col === toCol);

  if (!isLegalMove) {
    return { success: false, error: '這不是一個合法的移動' };
  }

  // 建立新的棋盤
  const newBoard: Board = gameState.board.map((r) => [...r]);
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  // 切換當前玩家
  const newTurn = gameState.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

  return {
    success: true,
    newGameState: {
      board: newBoard,
      currentTurn: newTurn,
      moveHistory: [...gameState.moveHistory, { from: [fromRow, fromCol], to: [toRow, toCol] }],
    },
  };
}
