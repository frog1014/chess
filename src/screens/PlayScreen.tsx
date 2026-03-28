import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.title')}</Text>
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
      <View style={styles.turnInfo}>
        <Text style={styles.turnText}>
          {t('game.currentPlayer')}: {playerName}
        </Text>
        <View style={styles.metaSlot}>
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
        </View>
      </View>
      <ChessBoard
        board={gameState.board}
        selectedSquare={selectedSquare}
        tutorialMode={tutorialMode}
        onSquarePress={handleSquarePress}
      />
      <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
        <Text style={styles.buttonText}>{t('app.newGame')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  topRightBar: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tutorialButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  tutorialButtonOn: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
  },
  tutorialButtonText: {
    color: '#424242',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tutorialButtonTextOn: {
    color: 'white',
  },
  languageButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  languageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  turnInfo: {
    marginBottom: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  turnText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  metaSlot: {
    marginTop: 6,
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pieceTutorialBlock: {
    marginTop: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  pieceTutorialRules: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
    textAlign: 'center',
  },
  pieceTutorialSituation: {
    fontSize: 13,
    color: '#0D47A1',
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  selectedPieceText: {
    fontSize: 16,
    color: '#333',
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
  newGameButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
