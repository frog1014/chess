import React, { useEffect, useRef } from 'react'; //
import { Animated, View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import {
  getLegalMovesFromSquare,
  getPieceUnicode,
  type Board,
  type BoardSquare,
  type PieceColor,
} from '../utils/chessLogic';



const { width, height } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, Math.floor(height * 0.6));
const SQUARE_SIZE = BOARD_SIZE / 8;

export interface SelectedSquare {
  row: number;
  col: number;
}

interface ChessBoardProps {
  currentTurn: PieceColor;
  board: Board;
  selectedSquare: SelectedSquare | null;
  tutorialMode: boolean;
  moveHistory?: Array<{ from: [number, number]; to: [number, number] }>;
  onSquarePress: (row: number, col: number) => void;
}

export function ChessBoard({ currentTurn, board, selectedSquare, tutorialMode, moveHistory = [], onSquarePress }: ChessBoardProps) {
  // 在你的組件內部
  const breatheAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const isCurrentPlayerPiece = (piece: BoardSquare) => piece?.color === currentTurn;

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
            // 初始化縮放值，從 1 (原始大小) 到 1.1 (放大 10%)

            useEffect(() => {
              // 啟動一個無限循環的縮放動畫
              Animated.loop(
                Animated.sequence([
                  Animated.timing(scaleAnim, {
                    toValue: 1.3,      // 放大
                    duration: 1000,     // 縮放頻率通常比顏色呼吸快一點點更有節奏感
                    useNativeDriver: true, // 縮放支援 Native Driver，效能更好
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1,        // 回到原始大小
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                ])
              ).start();
            }, []);

            useEffect(() => {
              if (showLegal) {
                // 2. 啟動循環動畫
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(breatheAnim, {
                      toValue: 1,
                      duration: 1000,
                      useNativeDriver: false, // 因為陰影和背景色不支援 Native Driver
                    }),
                    Animated.timing(breatheAnim, {
                      toValue: 0.4,
                      duration: 1000,
                      useNativeDriver: false,
                    }),
                  ])
                ).start();
              } else {
                breatheAnim.setValue(0.4); // 若不是合法移動則重置
              }
            }, [showLegal]);



            const showHistory = tutorialMode && (isLastFrom || isLastTo);
            return (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.square,
                  { width: SQUARE_SIZE, height: SQUARE_SIZE },
                  // 基礎底色
                  isLight ? styles.lightSquare : styles.darkSquare,
                  // 最後移動的底色 (會蓋在基礎底色上)
                  showHistory && styles.lastMoveSquare,
                  // 選中狀態的邊框/發光
                  isSelected && styles.selectedSquare,
                ]}
                onPress={() => onSquarePress(rowIndex, colIndex)}
              >
                {/* 第一層：呼吸燈 - 增加 zIndex 確保不被 darkSquare 遮擋 */}
                {showLegal && (
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      styles.legalMoveSquare,
                      { opacity: breatheAnim, zIndex: 1 } // 強制置頂於背景之上
                    ]}
                  />
                )}

                {/* 第二層：內容容器 - zIndex 更高以確保文字在最上層 */}
                <View style={[styles.contentContainer, { zIndex: 2 }]}>
                  {/* 第三層：棋子本體 - 改為 Animated.Text */}
                  <Animated.Text
                    style={[
                      styles.piece,
                      // 判斷：如果是目前輪到的玩家棋子，則套用縮放動畫
                      isCurrentPlayerPiece(piece) && {
                        transform: [{ scale: scaleAnim }]
                      }
                    ]}
                  >
                    {renderPiece(piece)}
                  </Animated.Text>

                  {showHistory && (
                    <Text style={styles.moveNumber}>{isLastFrom ? '1' : '2'}</Text>
                  )}
                </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent'
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
    backgroundColor: 'rgba(9, 198, 15, 0.45)',

    // 2. 移除 borderRadius 避免黑邊問題
    borderRadius: 0,

    // 3. 使用內縮邊框 (Inset Border) 模擬發光邊緣
    // 這樣視覺上會像圖片中格子邊緣有一層亮光，但不會破壞格子形狀
    borderWidth: 3,
    borderColor: 'rgba(120, 255, 120, 0.4)',

    // 4. 強化發光感 (不會影響佈局)
    elevation: 16,
    shadowColor: '#04904a',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },

    // 5. 確保內部內容居中
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSquare: {
    backgroundColor: 'rgba(186, 202, 68, 0.5)', // 使用 rgba 增加通透感
    // --- 關鍵：內發光感 ---
    borderWidth: 2,
    borderRadius: 8,
    borderColor: '#BACA44',
    // iOS 發光
    shadowColor: '#BACA44',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    // Android 發光
    elevation: 15,
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
    opacity: 1,
  },
  piece: {
    fontSize: 32,
  },
});
