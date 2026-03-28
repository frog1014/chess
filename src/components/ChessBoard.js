import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { getPieceUnicode } from '../utils/chessLogic';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, 400);
const SQUARE_SIZE = BOARD_SIZE / 8;

export function ChessBoard({ board, selectedSquare, onSquarePress }) {
  const renderPiece = (piece) => {
    if (!piece) return '';
    return getPieceUnicode(piece.type, piece.color);
  };

  const isSquareSelected = (row, col) => {
    return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
  };

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0;
          const isSelected = isSquareSelected(rowIndex, colIndex);

          return (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.square,
                isLight ? styles.lightSquare : styles.darkSquare,
                isSelected && styles.selectedSquare,
              ]}
              onPress={() => onSquarePress(rowIndex, colIndex)}
            >
              <Text style={styles.piece}>{renderPiece(piece)}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#8B7355',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#666',
  },
  lightSquare: {
    backgroundColor: '#F0D9B5',
  },
  darkSquare: {
    backgroundColor: '#B58863',
  },
  selectedSquare: {
    backgroundColor: '#BACA44',
    opacity: 0.8,
  },
  piece: {
    fontSize: 32,
  },
});
