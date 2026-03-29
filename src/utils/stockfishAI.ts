import {
  mainLoop,
  shutdownStockfish,
  sendCommand,
} from 'react-native-stockfish-chess-engine';
import { NativeEventEmitter, NativeModules } from 'react-native';

export type AIMove = {
  from: [number, number];
  to: [number, number];
};

const COL_MAP: Record<string, number> = {
  a: 0, b: 1, c: 2, d: 3,
  e: 4, f: 5, g: 6, h: 7,
};

function parseUciMove(uci: string): AIMove {
  return {
    from: [8 - parseInt(uci[1]), COL_MAP[uci[0]]],
    to:   [8 - parseInt(uci[3]), COL_MAP[uci[2]]],
  };
}

// ✅ 正確的 EventEmitter 初始化方式
const eventEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeStockfishChessEngine
);

let currentSubscription: { remove: () => void } | null = null;
let initialized = false;

export async function initStockfish(skillLevel = 10) {
  if (initialized) return;
  await mainLoop(); // 啟動引擎 process
  sendCommand('uci');
  sendCommand('isready');
  sendCommand(`setoption name Skill Level value ${skillLevel}`);
  initialized = true;
}

export function requestAIMove(
  fen: string,
  depth = 10,
  onMove: (move: AIMove) => void,
) {
  // 先移除上一個 listener
  if (currentSubscription) {
    currentSubscription.remove();
    currentSubscription = null;
  }

  // ✅ 正確的監聽方式：監聽 'stockfish-output' 事件
  currentSubscription = eventEmitter.addListener('stockfish-output', (line: string) => {
    if (line.startsWith('bestmove')) {
      const moveStr = line.split(' ')[1];
      if (!moveStr || moveStr === '(none)') return;

      // 收到結果後立刻取消，避免重複觸發
      currentSubscription?.remove();
      currentSubscription = null;

      onMove(parseUciMove(moveStr));
    }
  });

  sendCommand(`position fen ${fen}`);
  sendCommand(`go depth ${depth}`);
}

export function stopStockfish() {
  currentSubscription?.remove();
  currentSubscription = null;
  sendCommand('stop');
  shutdownStockfish();
  initialized = false;
}