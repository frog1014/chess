import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import {
  getLegalMovesFromSquare,
  getPieceUnicode,
  type Board,
  type BoardSquare,
} from '../utils/chessLogic';

const { width, height } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, Math.floor(height * 0.6));
const SQUARE_SIZE = BOARD_SIZE / 8;

export interface SelectedSquare {
  row: number;
  col: number;
}

interface ChessBoardProps {
  board: Board;
  selectedSquare: SelectedSquare | null;
  tutorialMode: boolean;
  moveHistory?: Array<{ from: [number, number]; to: [number, number] }>;
  onSquarePress: (row: number, col: number) => void;
}

export function ChessBoard({ board, selectedSquare, tutorialMode, moveHistory = [], onSquarePress }: ChessBoardProps) {
  const renderPiece = (piece: BoardSquare) => {
    if (!piece) return '';
    return getPieceUnicode(piece.type, piece.color);
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
  };

  const legalTargets =
    tutorialMode && selectedSquare
      ? getLegalMovesFromSquare(board, selectedSquare.row, selectedSquare.col)
      : [];

  const isLegalTarget = (row: number, col: number) =>
    legalTargets.some((m) => m.row === row && m.col === col);

  const lastMove = moveHistory && moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
  const isLastMoveFrom = (row: number, col: number) => lastMove && lastMove.from[0] === row && lastMove.from[1] === col;
  const isLastMoveTo = (row: number, col: number) => lastMove && lastMove.to[0] === row && lastMove.to[1] === col;

  return (
    <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = isSquareSelected(rowIndex, colIndex);
            const showLegal = isLegalTarget(rowIndex, colIndex);
            const isLastFrom = isLastMoveFrom(rowIndex, colIndex);
            const isLastTo = isLastMoveTo(rowIndex, colIndex);

            return (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.square,
                  { width: SQUARE_SIZE, height: SQUARE_SIZE },
                  isLight ? styles.lightSquare : styles.darkSquare,
                  isSelected && styles.selectedSquare,
                  (isLastFrom || isLastTo) && styles.lastMoveSquare,
                  showLegal && styles.legalMoveSquare,
                ]}
                onPress={() => onSquarePress(rowIndex, colIndex)}
              >
                <Text style={styles.piece}>{renderPiece(piece)}</Text>
                {isLastFrom && <Text style={styles.moveNumber}>1</Text>}
                {isLastTo && <Text style={styles.moveNumber}>2</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#2a2a2a',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightSquare: {
    backgroundColor: '#D8DDE3',
  },
  darkSquare: {
    backgroundColor: '#344561',
  },
  legalMoveSquare: {
    backgroundColor: 'rgba(76, 175, 80, 0.45)',
  },
  selectedSquare: {
    backgroundColor: '#BACA44',
    opacity: 0.85,
  },
  lastMoveSquare: {
    backgroundColor: 'rgba(237, 99, 135, 0.6)',
  },
  moveNumber: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(8, 8, 8, 0.8)',
    borderRadius: 12,
    width: 16,
    height: 16,
    textAlign: 'center',
    lineHeight: 16,
    bottom: 4,
    right: 4,
    opacity: 0.8,
  },
  piece: {
    fontSize: 32,
  },
});
