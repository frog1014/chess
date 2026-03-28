import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChessBoard } from '../components/ChessBoard';
import { initializeChessGame, makeMove } from '../utils/chessLogic';

const { width } = Dimensions.get('window');

export function PlayScreen() {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState(initializeChessGame());
  const [selectedSquare, setSelectedSquare] = useState(null);

  const handleSquarePress = (row, col) => {
    if (selectedSquare === null) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        setSelectedSquare({ row, col });
      }
    } else {
      const result = makeMove(gameState, selectedSquare.row, selectedSquare.col, row, col);
      if (result.success) {
        setGameState(result.newGameState);
        setSelectedSquare(null);
      } else {
        setSelectedSquare(null);
      }
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

  const playerName = gameState.currentTurn === 'white' ? t('game.whitePiece') : t('game.blackPiece');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.title')}</Text>
      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
        <Text style={styles.languageButtonText}>
          {i18n.language === 'zh-TW' ? 'EN' : '中文'}
        </Text>
      </TouchableOpacity>
      <View style={styles.turnInfo}>
        <Text style={styles.turnText}>
          {t('game.currentPlayer')}: {playerName}
        </Text>
      </View>
      <ChessBoard
        board={gameState.board}
        selectedSquare={selectedSquare}
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
    justifyContent: 'center',
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
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
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
  },
  turnText: {
    fontSize: 16,
    color: '#666',
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
