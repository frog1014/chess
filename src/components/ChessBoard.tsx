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
  onSquarePress: (row: number, col: number) => void;
}

export function ChessBoard({ board, selectedSquare, tutorialMode, onSquarePress }: ChessBoardProps) {
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

  return (
    <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = isSquareSelected(rowIndex, colIndex);
            const showLegal = isLegalTarget(rowIndex, colIndex);

            return (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.square,
                  { width: SQUARE_SIZE, height: SQUARE_SIZE },
                  isLight ? styles.lightSquare : styles.darkSquare,
                  showLegal && styles.legalMoveSquare,
                  isSelected && styles.selectedSquare,
                ]}
                onPress={() => onSquarePress(rowIndex, colIndex)}
              >
                <Text style={styles.piece}>{renderPiece(piece)}</Text>
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
    backgroundColor: '#f0f0f0',
  },
  darkSquare: {
    backgroundColor: '#b0b0b0',
  },
  legalMoveSquare: {
    backgroundColor: 'rgba(76, 175, 80, 0.45)',
  },
  selectedSquare: {
    backgroundColor: '#BACA44',
    opacity: 0.85,
  },
  piece: {
    fontSize: 32,
  },
});
