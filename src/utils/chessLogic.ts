export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  type: PieceType;
  color: 'white' | 'black';
}

export interface GameState {
  board: (Piece | null)[][];
  currentTurn: 'white' | 'black';
  moveHistory: Array<{ from: [number, number]; to: [number, number] }>;
}

export const PIECE_TYPES = {
  PAWN: 'pawn',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king',
} as const;

export const COLORS = {
  WHITE: 'white',
  BLACK: 'black',
} as const;

export function getPieceUnicode(type: PieceType, color: 'white' | 'black') {
  const pieces = {
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

  return pieces[color][type] || '';
}

function initializeBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  // black pieces
  board[0] = [
    { type: PIECE_TYPES.ROOK, color: COLORS.BLACK },
    { type: PIECE_TYPES.KNIGHT, color: COLORS.BLACK },
    { type: PIECE_TYPES.BISHOP, color: COLORS.BLACK },
    { type: PIECE_TYPES.QUEEN, color: COLORS.BLACK },
    { type: PIECE_TYPES.KING, color: COLORS.BLACK },
    { type: PIECE_TYPES.BISHOP, color: COLORS.BLACK },
    { type: PIECE_TYPES.KNIGHT, color: COLORS.BLACK },
    { type: PIECE_TYPES.ROOK, color: COLORS.BLACK },
  ];

  board[1] = Array.from({ length: 8 }, () => ({ type: PIECE_TYPES.PAWN, color: COLORS.BLACK }));

  board[6] = Array.from({ length: 8 }, () => ({ type: PIECE_TYPES.PAWN, color: COLORS.WHITE }));

  board[7] = [
    { type: PIECE_TYPES.ROOK, color: COLORS.WHITE },
    { type: PIECE_TYPES.KNIGHT, color: COLORS.WHITE },
    { type: PIECE_TYPES.BISHOP, color: COLORS.WHITE },
    { type: PIECE_TYPES.QUEEN, color: COLORS.WHITE },
    { type: PIECE_TYPES.KING, color: COLORS.WHITE },
    { type: PIECE_TYPES.BISHOP, color: COLORS.WHITE },
    { type: PIECE_TYPES.KNIGHT, color: COLORS.WHITE },
    { type: PIECE_TYPES.ROOK, color: COLORS.WHITE },
  ];

  return board;
}

export function initializeChessGame(): GameState {
  return {
    board: initializeBoard(),
    currentTurn: COLORS.WHITE,
    moveHistory: [],
  };
}

function inBounds(row: number, col: number) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getPawnMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  const moves: Array<{ row: number; col: number }> = [];
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;
  const nextRow = row + direction;

  if (inBounds(nextRow, col) && !board[nextRow][col]) {
    moves.push({ row: nextRow, col });
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  for (const deltaCol of [-1, 1]) {
    const newCol = col + deltaCol;
    if (inBounds(nextRow, newCol)) {
      const targetPiece = board[nextRow][newCol];
      if (targetPiece && targetPiece.color !== color) {
        moves.push({ row: nextRow, col: newCol });
      }
    }
  }

  return moves;
}

function getRookMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  const moves: Array<{ row: number; col: number }> = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  directions.forEach(([dr, dc]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      if (!inBounds(newRow, newCol)) break;
      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
        break;
      }
    }
  });

  return moves;
}

function getKnightMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  const moves: Array<{ row: number; col: number }> = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  offsets.forEach(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    if (!inBounds(newRow, newCol)) return;
    const targetPiece = board[newRow][newCol];
    if (!targetPiece || targetPiece.color !== color) {
      moves.push({ row: newRow, col: newCol });
    }
  });

  return moves;
}

function getBishopMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  const moves: Array<{ row: number; col: number }> = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  directions.forEach(([dr, dc]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      if (!inBounds(newRow, newCol)) break;
      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
        break;
      }
    }
  });

  return moves;
}

function getQueenMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
}

function getKingMoves(board: (Piece | null)[][], row: number, col: number, color: 'white' | 'black') {
  const moves: Array<{ row: number; col: number }> = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  offsets.forEach(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    if (!inBounds(newRow, newCol)) return;
    const targetPiece = board[newRow][newCol];
    if (!targetPiece || targetPiece.color !== color) {
      moves.push({ row: newRow, col: newCol });
    }
  });

  return moves;
}

function getLegalMoves(board: (Piece | null)[][], row: number, col: number) {
  const piece = board[row][col];
  if (!piece) return [];

  switch (piece.type) {
    case PIECE_TYPES.PAWN:
      return getPawnMoves(board, row, col, piece.color);
    case PIECE_TYPES.ROOK:
      return getRookMoves(board, row, col, piece.color);
    case PIECE_TYPES.KNIGHT:
      return getKnightMoves(board, row, col, piece.color);
    case PIECE_TYPES.BISHOP:
      return getBishopMoves(board, row, col, piece.color);
    case PIECE_TYPES.QUEEN:
      return getQueenMoves(board, row, col, piece.color);
    case PIECE_TYPES.KING:
      return getKingMoves(board, row, col, piece.color);
    default:
      return [];
  }
}

export type MoveResult =
  | { success: true; newGameState: GameState }
  | { success: false; error: string };

export function makeMove(
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
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

  const newBoard = gameState.board.map((row) => row.slice());
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

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
