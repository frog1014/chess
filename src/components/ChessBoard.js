import { View, StyleSheet, TouchableOpacity, Text, Dimensions, FlatList } from 'react-native';
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

  // 將棋盤展平為一維陣列以供 FlatList 使用
  const flattenedBoard = [];
  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      flattenedBoard.push({
        id: `${rowIndex}-${colIndex}`,
        rowIndex,
        colIndex,
        piece,
      });
    });
  });

  const renderSquare = ({ item }) => {
    const { rowIndex, colIndex, piece } = item;
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const isSelected = isSquareSelected(rowIndex, colIndex);

    return (
      <TouchableOpacity
        style={[
          styles.square,
          { width: SQUARE_SIZE, height: SQUARE_SIZE },
          isLight ? styles.lightSquare : styles.darkSquare,
          isSelected && styles.selectedSquare,
        ]}
        onPress={() => onSquarePress(rowIndex, colIndex)}
      >
        <Text style={styles.piece}>{renderPiece(piece)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={flattenedBoard}
        renderItem={renderSquare}
        keyExtractor={item => item.id}
        numColumns={8}
        scrollEnabled={false}
        style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    borderWidth: 3,
    borderColor: '#333',
    backgroundColor: '#8B7355',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightSquare: {
    backgroundColor: '#F0D9B5',
  },
  darkSquare: {
    backgroundColor: '#B58863',
  },
  selectedSquare: {
    backgroundColor: '#BACA44',
    opacity: 0.85,
  },
  piece: {
    fontSize: 32,
  },
});
