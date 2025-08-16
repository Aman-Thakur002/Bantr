import { Router } from 'express';
import Joi from 'joi';
import * as tictactoeService from './tictactoe.service.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { success } from '../../utils/response.js';

const router = Router();

// Validation schemas
const createGameSchema = Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
});

const gameIdSchema = Joi.object({
    id: Joi.string().min(1),
});

const makeMoveSchema = Joi.object({
   position: Joi.number().min(0).max(8),
});

const conversationGamesSchema = Joi.object({

    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),

});

// All routes require authentication
router.use(authenticate);

// Tic-Tac-Toe game routes
async function createTicTacToeGame(req, res) {
  const { conversationId } = req.body;

  const game = await tictactoeService.createGame(req.user._id.toString(), conversationId);

  res.status(201).json(success(game, 'Tic-Tac-Toe game created'));
};

async function joinTicTacToeGame(req,res) {
  const { id: gameId } = req.params;
  
  const game = tictactoeService.joinGame(gameId, req.user._id.toString());
  
  res.json(success(game, 'Joined Tic-Tac-Toe game'));
};

async function getTicTacToeGame(req,res){
  const { id: gameId } = req.params;
  
  const game = tictactoeService.getGame(gameId);
  
  res.json(success(game));
};

async function makeTicTacToeMove(req, res) {
  const { id: gameId } = req.params;
  const { position } = req.body;
  
  const game = tictactoeService.makeMove(gameId, req.user._id.toString(), position);
  
  res.json(success(game, 'Move made'));
}

async function resetTicTacToeGame(req, res) {
  const { id: gameId } = req.params;
  
  const game = tictactoeService.resetGame(gameId, req.user._id.toString());
  
  res.json(success(game, 'Game reset'));
}

async function getConversationGames(req, res) {
  const { conversationId } = req.query;
  
  const games = tictactoeService.getGamesByConversation(conversationId);
  
  res.json(success(games));
};

// Game routes
router.post('/tictactoe', validate(createGameSchema), createTicTacToeGame);
router.get('/tictactoe', validate(conversationGamesSchema), getConversationGames);
router.get('/tictactoe/:id', validate(gameIdSchema), getTicTacToeGame);
router.post('/tictactoe/:id/join', validate(gameIdSchema), joinTicTacToeGame);
router.post('/tictactoe/:id/move', validate(gameIdSchema), validate(makeMoveSchema), makeTicTacToeMove);
router.post('/tictactoe/:id/reset', validate(gameIdSchema), resetTicTacToeGame);

export default router;