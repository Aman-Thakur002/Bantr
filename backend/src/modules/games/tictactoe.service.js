import { AppError } from '../../middleware/errors.js';

// In-memory game storage (in production, use Redis or database)
const games = new Map();

const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const checkWinner = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

export const createGame = (playerId, conversationId) => {
  const gameId = generateGameId();
  
  const game = {
    id: gameId,
    conversationId,
    players: [playerId],
    currentPlayer: 0,
    board: Array(9).fill(null),
    status: 'waiting',
    winner: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  games.set(gameId, game);
  return game;
};

export const joinGame = (gameId, playerId) => {
  const game = games.get(gameId);
  
  if (!game) {
    throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
  }

  if (game.status !== 'waiting') {
    throw new AppError('Game is not accepting players', 400, 'GAME_NOT_WAITING');
  }

  if (game.players.includes(playerId)) {
    throw new AppError('Already in this game', 400, 'ALREADY_JOINED');
  }

  if (game.players.length >= 2) {
    throw new AppError('Game is full', 400, 'GAME_FULL');
  }

  game.players.push(playerId);
  game.status = 'playing';
  game.updatedAt = new Date();

  return game;
};

export const makeMove = (gameId, playerId, position) => {
  const game = games.get(gameId);
  
  if (!game) {
    throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
  }

  if (game.status !== 'playing') {
    throw new AppError('Game is not active', 400, 'GAME_NOT_ACTIVE');
  }

  const playerIndex = game.players.indexOf(playerId);
  if (playerIndex === -1) {
    throw new AppError('Not a player in this game', 403, 'NOT_PLAYER');
  }

  if (game.currentPlayer !== playerIndex) {
    throw new AppError('Not your turn', 400, 'NOT_YOUR_TURN');
  }

  if (position < 0 || position > 8) {
    throw new AppError('Invalid position', 400, 'INVALID_POSITION');
  }

  if (game.board[position] !== null) {
    throw new AppError('Position already taken', 400, 'POSITION_TAKEN');
  }

  game.board[position] = playerIndex === 0 ? 'X' : 'O';
  
  const winner = checkWinner(game.board);
  if (winner) {
    game.status = 'finished';
    game.winner = winner === 'X' ? game.players[0] : game.players[1];
  } else if (game.board.every(cell => cell !== null)) {
    game.status = 'finished';
    game.winner = null;
  } else {
    game.currentPlayer = 1 - game.currentPlayer;
  }

  game.updatedAt = new Date();
  return game;
};

export const getGame = (gameId) => {
  const game = games.get(gameId);
  if (!game) {
    throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  return game;
};

export const getGamesByConversation = (conversationId) => {
  return Array.from(games.values())
    .filter(game => game.conversationId === conversationId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const resetGame = (gameId, playerId) => {
  const game = games.get(gameId);
  
  if (!game) {
    throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
  }

  if (!game.players.includes(playerId)) {
    throw new AppError('Not a player in this game', 403, 'NOT_PLAYER');
  }

  game.board = Array(9).fill(null);
  game.currentPlayer = 0;
  game.status = 'playing';
  game.winner = null;
  game.updatedAt = new Date();

  return game;
};

export const deleteGame = (gameId) => {
  return games.delete(gameId);
};

export const cleanupOldGames = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const [gameId, game] of games.entries()) {
    if (game.updatedAt < oneHourAgo) {
      games.delete(gameId);
    }
  }
};