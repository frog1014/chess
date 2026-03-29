import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChessBoard, type SelectedSquare } from '../components/ChessBoard';
import {
  getBoardZone,
  getNoMovesReason,
  getPawnTutorialSituation,
  getQueenTutorialSituation,
  initializeChessGame,
  makeMove,
  type GameState,
} from '../utils/chessLogic';

export function PlayScreen() {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(() => initializeChessGame());
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare | null>(null);
  const [tutorialMode, setTutorialMode] = useState(false);
  const handleSquarePress = (row: number, col: number) => {
    const pieceAtTarget = gameState.board[row][col];

    if (selectedSquare === null) {
      if (pieceAtTarget && pieceAtTarget.color === gameState.currentTurn) {
        setSelectedSquare({ row, col });
      }
      return;
    }

    if (selectedSquare.row === row && selectedSquare.col === col) {
      setSelectedSquare(null);
      return;
    }

    if (pieceAtTarget && pieceAtTarget.color === gameState.currentTurn) {
      setSelectedSquare({ row, col });
      return;
    }

    const result = makeMove(gameState, selectedSquare.row, selectedSquare.col, row, col);
    if (result.success) {
      setGameState(result.newGameState);
      setSelectedSquare(null);
    }
  };

  const handleNewGame = () => {
    setGameState(initializeChessGame());
    setSelectedSquare(null);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-TW' ? 'en' : 'zh-TW';
    i18n.changeLanguage(newLang);
  };

  const toggleTutorialMode = () => {
    setTutorialMode((v) => !v);
    setSelectedSquare(null);
  };

  const playerName = gameState.currentTurn === 'white' ? t('game.whitePiece') : t('game.blackPiece');

  const selectedPieceDescription = (() => {
    if (!selectedSquare) return null;
    const piece = gameState.board[selectedSquare.row][selectedSquare.col];
    if (!piece) return null;
    const colorLabel = piece.color === 'white' ? t('game.whitePiece') : t('game.blackPiece');
    const typeLabel = t(`game.pieces.${piece.type}`);
    return `${colorLabel} ${typeLabel}`;
  })();

  const noMovesReason = (() => {
    if (!selectedSquare) return null;
    return getNoMovesReason(gameState.board, selectedSquare.row, selectedSquare.col);
  })();

  const selectedPiece =
    selectedSquare != null ? gameState.board[selectedSquare.row][selectedSquare.col] : null;

  const tutorialBoardZone =
    tutorialMode && selectedSquare ? getBoardZone(selectedSquare.row, selectedSquare.col) : null;

  const pawnTutorialSituation =
    tutorialMode && selectedPiece?.type === 'pawn' && selectedSquare
      ? getPawnTutorialSituation(gameState.board, selectedSquare.row, selectedSquare.col)
      : null;

  const queenTutorialSituation =
    tutorialMode && selectedPiece?.type === 'queen' && selectedSquare
      ? getQueenTutorialSituation(gameState.board, selectedSquare.row, selectedSquare.col)
      : null;

  return (
    <View style={[styles.container]} >
      <TouchableOpacity style={styles.newGameTopLeft} onPress={handleNewGame}>
        <Text style={styles.newGameTopLeftText}>{t('app.newGame')}</Text>
      </TouchableOpacity>
      <View style={styles.topRightBar}>
        <TouchableOpacity
          style={[styles.tutorialButton, tutorialMode && styles.tutorialButtonOn]}
          onPress={toggleTutorialMode}
          accessibilityRole="switch"
          accessibilityState={{ checked: tutorialMode }}
        >
          <Text style={[styles.tutorialButtonText, tutorialMode && styles.tutorialButtonTextOn]}>
            {t('app.tutorial')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageButtonText}>
            {i18n.language === 'zh-TW' ? 'EN' : '中文'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.upperContent}>
        <Text style={styles.title}>{t('app.title')}</Text>
        <View style={styles.turnInfo}>
          <Text style={styles.turnText}>
            {t('game.currentPlayer')}: {playerName}
          </Text>
          <ScrollView
            style={styles.metaScroll}
            contentContainerStyle={styles.metaScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {selectedPieceDescription ? (
              <Text style={styles.selectedPieceText} accessibilityLiveRegion="polite">
                {t('game.selectedPiece')}: {selectedPieceDescription}
              </Text>
            ) : null}
            {tutorialMode && selectedSquare && selectedPiece ? (
              <View
                key={`tut-${selectedPiece.type}-${selectedSquare.row}-${selectedSquare.col}-${tutorialBoardZone ?? ''}-${queenTutorialSituation ?? ''}-${pawnTutorialSituation ?? ''}`}
                style={styles.pieceTutorialBlock}
              >
                <Text style={styles.pieceTutorialRules}>
                  {t(`game.tutorial.${selectedPiece.type}Rules`)}
                </Text>
                {pawnTutorialSituation ? (
                  <Text style={styles.pieceTutorialSituation}>
                    {t(`game.tutorial.pawnSituation.${pawnTutorialSituation}`)}
                  </Text>
                ) : null}
                {queenTutorialSituation ? (
                  <Text style={styles.pieceTutorialSituation}>
                    {t(`game.tutorial.queenSituation.${queenTutorialSituation}`)}
                  </Text>
                ) : null}
                {selectedPiece.type === 'rook' && tutorialBoardZone ? (
                  <Text style={styles.pieceTutorialSituation}>
                    {t(`game.tutorial.rookSituation.${tutorialBoardZone}`)}
                  </Text>
                ) : null}
                {selectedPiece.type === 'knight' && tutorialBoardZone ? (
                  <Text style={styles.pieceTutorialSituation}>
                    {t(`game.tutorial.knightSituation.${tutorialBoardZone}`)}
                  </Text>
                ) : null}
                {selectedPiece.type === 'king' && tutorialBoardZone ? (
                  <Text style={styles.pieceTutorialSituation}>
                    {t(`game.tutorial.kingSituation.${tutorialBoardZone}`)}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {tutorialMode && noMovesReason && selectedSquare ? (
              <Text
                key={`hint-${noMovesReason}-${selectedSquare.row}-${selectedSquare.col}`}
                style={styles.noMovesHint}
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.noMovesTitle}>{t('game.noMoves.title')}</Text>
                {'\n'}
                {t(`game.noMoves.${noMovesReason}`)}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>

      <View style={styles.boardBottom}>
        <ChessBoard
          board={gameState.board}
          selectedSquare={selectedSquare}
          tutorialMode={tutorialMode}
          moveHistory={gameState.moveHistory}
          onSquarePress={handleSquarePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1E37',
    paddingTop: 24
  },
  upperContent: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    paddingTop: 56,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    letterSpacing: 2,
  },
  newGameTopLeft: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 2,
    backgroundColor: '#4E9F3D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 15,
    shadowColor: '#fff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  newGameTopLeftText: {
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topRightBar: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tutorialButton: {
    backgroundColor: '#c8926b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0,
    elevation: 8,
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tutorialButtonOn: {
    backgroundColor: '#c8926b',
    borderColor: '#a0714a',
  },
  tutorialButtonText: {
    color: '#2d2d2d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tutorialButtonTextOn: {
    color: 'white',
  },
  languageButton: {
    backgroundColor: '#9e9e9e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  languageButtonText: {
    color: '#2d2d2d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  turnInfo: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignItems: 'center',
  },
  turnText: {
    fontSize: 16,
    color: '#b0bec5',
    textAlign: 'center',
    marginBottom: 6,
  },
  metaScroll: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  metaScrollContent: {
    paddingBottom: 16,
    alignItems: 'center',
    width: '100%',
    flexGrow: 1,
  },
  boardBottom: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  pieceTutorialBlock: {
    marginTop: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  pieceTutorialRules: {
    fontSize: 13,
    color: '#64b5f6',
    lineHeight: 20,
    textAlign: 'center',
  },
  pieceTutorialSituation: {
    fontSize: 13,
    color: '#81c784',
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  selectedPieceText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  noMovesHint: {
    fontSize: 14,
    color: '#b71c1c',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  noMovesTitle: {
    fontWeight: '700',
  },

  // 1. 新遊戲按鈕 (維持基準)
  newGameTopLeft: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 2,
    backgroundColor: '#3b556e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderTopWidth: 2,
    borderTopColor: '#5c7a96',
    borderBottomWidth: 4,
    borderBottomColor: '#1d2b38',
    borderLeftWidth: 1,
    borderLeftColor: '#4d6d8a',
    borderRightWidth: 1,
    borderRightColor: '#4d6d8a',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  newGameTopLeftText: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: 'bold',
    includeFontPadding: false, // 移除字體預設邊距
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // 2. 教學按鈕 (固定寬高避免跳動)
  tutorialButton: {
    backgroundColor: '#6b4d3c',
    borderRadius: 10,
    minWidth: 80,               // 鎖定寬度
    height: 46,                 // 鎖定高度
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#967462',
    borderBottomWidth: 4,
    borderBottomColor: '#3d2b22',
    borderLeftWidth: 1,
    borderLeftColor: '#825e4a',
    borderRightWidth: 1,
    borderRightColor: '#825e4a',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  tutorialButtonOn: {
    backgroundColor: '#8D6E63',
    borderTopColor: '#D7CCC8',
    borderBottomColor: '#5D4037',
    borderLeftColor: '#A1887F',
    borderRightColor: '#A1887F',
    // 這裡不寫邊框寬度，它會自動沿用 tutorialButton 的數值
  },
  tutorialButtonText: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: 'bold',
    includeFontPadding: false, // 關鍵：防止 Android 字體換行/位移
    textAlignVertical: 'center',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // 3. 語言按鈕 (固定寬高避免切換跳動)
  languageButton: {
    backgroundColor: '#525252',
    borderRadius: 10,
    minWidth: 60,               // 鎖定寬度，足以容納 EN 與 繁中
    height: 46,                 // 鎖定高度
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#7a7a7a',
    borderBottomWidth: 4,
    borderBottomColor: '#2b2b2b',
    borderLeftWidth: 1,
    borderLeftColor: '#636363',
    borderRightWidth: 1,
    borderRightColor: '#636363',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  languageButtonText: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: 'bold',
    includeFontPadding: false, // 關鍵：解決切換語系時的高低落差
    textAlignVertical: 'center',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
