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

function getRawMoves(board: Board, row: number, col: number): MoveCoord[] {
  const piece = board[row][col];
  if (!piece) return [];
  switch (piece.type) {
    case PIECE_TYPES.PAWN: return getPawnMoves(board, row, col, piece.color);
    case PIECE_TYPES.ROOK: return getRookMoves(board, row, col, piece.color);
    case PIECE_TYPES.KNIGHT: return getKnightMoves(board, row, col, piece.color);
    case PIECE_TYPES.BISHOP: return getBishopMoves(board, row, col, piece.color);
    case PIECE_TYPES.QUEEN: return getQueenMoves(board, row, col, piece.color);
    case PIECE_TYPES.KING: return getKingMoves(board, row, col, piece.color);
    default: return [];
  }
}

// 獲取合法的移動
function getLegalMoves(board: Board, row: number, col: number): MoveCoord[] {
  const piece = board[row][col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, row, col);

  // 過濾掉走完後讓自己被將軍的走法
  return rawMoves.filter(move => {
    const newBoard: Board = board.map(r => [...r]);
    newBoard[move.row][move.col] = piece;
    newBoard[row][col] = null;
    return !isInCheck(newBoard, piece.color);
  });
}

/** 教學／提示：該格若有棋子，回傳目前盤勢下的所有合法走格（與 makeMove 使用的規則相同）。 */
export function getLegalMovesFromSquare(board: Board, row: number, col: number): MoveCoord[] {
  return getLegalMoves(board, row, col);
}

/** i18n 鍵後綴：`game.noMoves.${reason}`，僅在該格棋子在當前盤面上沒有任何可走法時有意義。 */
export type NoMovesReason = 'pawn' | 'knight' | 'king' | 'slider';

export function getNoMovesReason(board: Board, row: number, col: number): NoMovesReason | null {
  const piece = board[row][col];
  if (!piece || getLegalMoves(board, row, col).length > 0) return null;

  switch (piece.type) {
    case PIECE_TYPES.PAWN:
      return 'pawn';
    case PIECE_TYPES.KNIGHT:
      return 'knight';
    case PIECE_TYPES.KING:
      return 'king';
    case PIECE_TYPES.ROOK:
    case PIECE_TYPES.BISHOP:
    case PIECE_TYPES.QUEEN:
      return 'slider';
  }
}

/** 教學用：兵在當前格時，可走型態依「是否在起始列／前方是否淨空」而變，供 UI 顯示情境句。 */
export type PawnTutorialSituation =
  | 'start_double_available'
  | 'start_single_only'
  | 'start_forward_blocked'
  | 'advanced';

export function getPawnTutorialSituation(
  board: Board,
  row: number,
  col: number,
): PawnTutorialSituation | null {
  const piece = board[row][col];
  if (!piece || piece.type !== PIECE_TYPES.PAWN) return null;

  const color = piece.color;
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;
  const nextRow = row + direction;
  const onStart = row === startRow;

  if (!onStart) {
    return 'advanced';
  }

  const forwardInBoard = nextRow >= 0 && nextRow < 8;
  const forwardBlocked = !forwardInBoard || !!board[nextRow][col];

  if (forwardBlocked) {
    return 'start_forward_blocked';
  }

  const twoRow = row + 2 * direction;
  const twoAheadInBoard = twoRow >= 0 && twoRow < 8;
  const twoAheadClear = twoAheadInBoard && !board[twoRow][col];

  if (twoAheadClear) {
    return 'start_double_available';
  }
  return 'start_single_only';
}

/** 棋格落在邊、角或內側：車、馬、王可走／可跳的「有效方向」會隨位置改變。 */
export type BoardZone = 'corner' | 'edge' | 'inner';

export function getBoardZone(row: number, col: number): BoardZone {
  const isCorner = (row === 0 || row === 7) && (col === 0 || col === 7);
  if (isCorner) return 'corner';
  const isEdge = row === 0 || row === 7 || col === 0 || col === 7;
  if (isEdge) return 'edge';
  return 'inner';
}

export type QueenTutorialSituation = 'mixed' | 'orthogonal_only' | 'diagonal_only';

/** 教學用：后在當前格若有可走法，依「本步實際能走的直橫 vs 斜線」分類（阻擋會改變路線型態）。 */
export function getQueenTutorialSituation(
  board: Board,
  row: number,
  col: number,
): QueenTutorialSituation | null {
  const piece = board[row][col];
  if (!piece || piece.type !== PIECE_TYPES.QUEEN) return null;
  const moves = getLegalMoves(board, row, col);
  if (moves.length === 0) return null;

  let hasOrtho = false;
  let hasDiag = false;
  for (const m of moves) {
    const dr = m.row - row;
    const dc = m.col - col;
    if (dr === 0 || dc === 0) {
      hasOrtho = true;
    } else if (Math.abs(dr) === Math.abs(dc)) {
      hasDiag = true;
    }
  }

  if (hasOrtho && hasDiag) return 'mixed';
  if (hasOrtho) return 'orthogonal_only';
  return 'diagonal_only';
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

// ✅ 貼到 chessLogic.ts 最底部

const PIECE_TO_FEN: Record<PieceType, string> = {
  pawn: 'p', rook: 'r', knight: 'n',
  bishop: 'b', queen: 'q', king: 'k',
};

export function boardToFen(board: Board, currentTurn: PieceColor): string {
  const rows = board.map((row) => {
    let fenRow = '';
    let empty = 0;
    for (const sq of row) {
      if (!sq) {
        empty++;
      } else {
        if (empty > 0) { fenRow += empty; empty = 0; }
        const ch = PIECE_TO_FEN[sq.type];
        fenRow += sq.color === COLORS.WHITE ? ch.toUpperCase() : ch;
      }
    }
    if (empty > 0) fenRow += empty;
    return fenRow;
  });

  const turn = currentTurn === COLORS.WHITE ? 'w' : 'b';
  return `${rows.join('/')} ${turn} - - 0 1`;
}

// ✅ 加在 boardToFen 下方

// 判斷某顏色的王是否被將軍
export function isInCheck(board: Board, color: PieceColor): boolean {
  let kingRow = -1;
  let kingCol = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq?.type === PIECE_TYPES.KING && sq.color === color) {
        kingRow = r; kingCol = c;
      }
    }
  }
  if (kingRow === -1) return false;

  const opponent = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq?.color !== opponent) continue;
      if (getRawMoves(board, r, c).some(m => m.row === kingRow && m.col === kingCol)) {
        return true;
      }
    }
  }
  return false;
}

// 判斷某顏色是否有任何合法走法
function hasAnyLegalMove(board: Board, color: PieceColor): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq?.color !== color) continue;
      if (getLegalMoves(board, r, c).length > 0) return true;
    }
  }
  return false;
}

export type GameResult =
  | { status: 'playing' }
  | { status: 'check'; color: PieceColor }          // 被將軍但還能走
  | { status: 'checkmate'; winner: PieceColor }      // 將死
  | { status: 'stalemate' };                         // 逼和

export function getGameResult(board: Board, currentTurn: PieceColor): GameResult {
  const inCheck = isInCheck(board, currentTurn);
  const canMove = hasAnyLegalMove(board, currentTurn);

  if (!canMove) {
    if (inCheck) {
      // 被將死，對方獲勝
      const winner = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
      return { status: 'checkmate', winner };
    } else {
      return { status: 'stalemate' };
    }
  }

  if (inCheck) {
    return { status: 'check', color: currentTurn };
  }

  return { status: 'playing' };
}