import { Router } from 'express';
import { z } from 'zod';
import * as tictactoeService from './tictactoe.service.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { success } from '../../utils/response.js';

const router = Router();

// Validation schemas
const createGameSchema = z.object({
  body: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

const gameIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const makeMoveSchema = z.object({
  body: z.object({
    position: z.number().min(0).max(8),
  }),
});

const conversationGamesSchema = z.object({
  query: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

// All routes require authentication
router.use(authenticate);

// Tic-Tac-Toe game routes
const createTicTacToeGame = async (req, res) => {
  const { conversationId } = req.body;

  const game = await tictactoeService.createGame(req.user._id.toString(), conversationId);

  res.status(201).json(success(game, 'Tic-Tac-Toe game created'));
};

const joinTicTacToeGame = asyncHandler(async (req, res) => {
  const { id: gameId } = req.params;
  
  const game = tictactoeService.joinGame(gameId, req.user._id.toString());
  
  res.json(success(game, 'Joined Tic-Tac-Toe game'));
});

const getTicTacToeGame = asyncHandler(async (req, res) => {
  const { id: gameId } = req.params;
  
  const game = tictactoeService.getGame(gameId);
  
  res.json(success(game));
});

const makeTicTacToeMove = asyncHandler(async (req, res) => {
  const { id: gameId } = req.params;
  const { position } = req.body;
  
  const game = tictactoeService.makeMove(gameId, req.user._id.toString(), position);
  
  res.json(success(game, 'Move made'));
});

const resetTicTacToeGame = asyncHandler(async (req, res) => {
  const { id: gameId } = req.params;
  
  const game = tictactoeService.resetGame(gameId, req.user._id.toString());
  
  res.json(success(game, 'Game reset'));
});

const getConversationGames = asyncHandler(async (req, res) => {
  const { conversationId } = req.query;
  
  const games = tictactoeService.getGamesByConversation(conversationId);
  
  res.json(success(games));
});

// Game routes
router.post('/tictactoe', validate(createGameSchema), createTicTacToeGame);
router.get('/tictactoe', validate(conversationGamesSchema), getConversationGames);
router.get('/tictactoe/:id', validate(gameIdSchema), getTicTacToeGame);
router.post('/tictactoe/:id/join', validate(gameIdSchema), joinTicTacToeGame);
router.post('/tictactoe/:id/move', validate(gameIdSchema), validate(makeMoveSchema), makeTicTacToeMove);
router.post('/tictactoe/:id/reset', validate(gameIdSchema), resetTicTacToeGame);

export default router;