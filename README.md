# chess-rn

Cross-platform chess (react-native, Expo) with a **tutorial mode**, English / Traditional Chinese UI, and TypeScript throughout app source.

## Features

- **Play** — Select your side’s pieces, legal moves only; tap another friendly piece to switch selection; illegal taps keep the current selection.
- **Tutorial** — Toggle highlights all legal destinations for the selected piece; piece-specific help text (pawn two-step / captures, queen axis mix, rook-knight-king board zones, bishop color binding, etc.).
- **No-move hints** — While tutorial is on, immobilized pieces show a short “why no moves” message.
- **i18n** — `en` and `zh-TW` locales under `src/locales/`.
- **Layout** — Scrollable hint area, board pinned to the bottom, **New game** top-left, tutorial + language top-right.
- **Safe areas** — `react-native-safe-area-context` (notches, home indicator).

Rules in this build are **piece movement and capture only** (no check, checkmate, castling, or en passant).

## Requirements

- Node.js (LTS recommended)
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (or use `npx`)

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm start`    | Expo dev server          |
| `npm run ios`  | Open iOS simulator       |
| `npm run android` | Android emulator/device |
| `npm run web`  | Web preview              |
| `npm test`     | Jest                     |

Typecheck (no emit):

```bash
npx tsc --noEmit
```

## Project layout

```
src/
  components/     # e.g. ChessBoard
  screens/        # PlayScreen
  utils/          # chessLogic (moves, tutorial helpers)
  locales/        # en.json, zh-TW.json
  i18n.ts
App.tsx
```

## License

MIT

## Notes about SDK and dependencies

- This branch pins Expo-related runtime versions to be compatible with the project's chosen Expo SDK.
- Current pinned versions (as of this commit):
  - `expo`: ^54.0.6
  - `react`: 19.1.0
  - `react-native`: 0.81.5

- Rationale: ensure the installed `expo` package and bundled native modules match the React / React Native versions to avoid native-module or peer-dependency mismatches.

