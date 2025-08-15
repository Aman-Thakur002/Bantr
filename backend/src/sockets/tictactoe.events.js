import * as tictactoeService from '../modules/games/tictactoe.service.js';
import logger from '../config/logger.js';

export function setupTicTacToeEvents(io) {
  io.on('connection', (socket) => {
    
    // Handle game moves
    socket.on('tictactoe:move', async (data) => {
      try {
        const { gameId, position } = data;

        if (typeof position !== 'number' || position < 0 || position > 8) {
          return socket.emit('error', { message: 'Invalid position' });
        }

        // Make the move
        const game = tictactoeService.makeMove(gameId, socket.userId, position);

        // Emit game state to all players in the game room
        io.to(`game:${gameId}`).emit('tictactoe:state', {
          gameId,
          game,
          move: {
            playerId: socket.userId,
            playerName: socket.user.name,
            position,
          },
        });

        // If game is finished, emit result
        if (game.status === 'finished') {
          const result = {
            gameId,
            winner: game.winner,
            isDraw: !game.winner,
            finalBoard: game.board,
          };

          if (game.winner) {
            io.to(`game:${gameId}`).emit('tictactoe:win', result);
          } else {
            io.to(`game:${gameId}`).emit('tictactoe:draw', result);
          }

          logger.debug(`Tic-Tac-Toe game ${gameId} finished: ${game.winner ? 'winner' : 'draw'}`);
        }

      } catch (error) {
        logger.error('Error handling tic-tac-toe move:', error);
        socket.emit('error', { message: error.message || 'Failed to make move' });
      }
    });

    // Handle game reset
    socket.on('tictactoe:reset', async (data) => {
      try {
        const { gameId } = data;

        const game = tictactoeService.resetGame(gameId, socket.userId);

        // Emit reset to all players
        io.to(`game:${gameId}`).emit('tictactoe:reset', {
          gameId,
          game,
          resetBy: {
            playerId: socket.userId,
            playerName: socket.user.name,
          },
        });

        logger.debug(`Tic-Tac-Toe game ${gameId} reset by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error resetting tic-tac-toe game:', error);
        socket.emit('error', { message: error.message || 'Failed to reset game' });
      }
    });

    // Handle getting game state
    socket.on('tictactoe:get_state', (data) => {
      try {
        const { gameId } = data;

        const game = tictactoeService.getGame(gameId);

        socket.emit('tictactoe:state', {
          gameId,
          game,
        });
      } catch (error) {
        logger.error('Error getting tic-tac-toe game state:', error);
        socket.emit('error', { message: error.message || 'Game not found' });
      }
    });

    // Handle joining game room
    socket.on('tictactoe:join_room', (data) => {
      try {
        const { gameId } = data;

        // Verify game exists and user is a player
        const game = tictactoeService.getGame(gameId);
        
        if (!game.players.includes(socket.userId)) {
          return socket.emit('error', { message: 'Not a player in this game' });
        }

        socket.join(`game:${gameId}`);

        // Send current game state
        socket.emit('tictactoe:state', {
          gameId,
          game,
        });

        // Notify other players
        socket.to(`game:${gameId}`).emit('tictactoe:player_joined', {
          gameId,
          playerId: socket.userId,
          playerName: socket.user.name,
        });

        logger.debug(`User ${socket.userId} joined tic-tac-toe game room ${gameId}`);
      } catch (error) {
        logger.error('Error joining tic-tac-toe game room:', error);
        socket.emit('error', { message: error.message || 'Failed to join game' });
      }
    });

    // Handle leaving game room
    socket.on('tictactoe:leave_room', (data) => {
      try {
        const { gameId } = data;

        socket.leave(`game:${gameId}`);

        // Notify other players
        socket.to(`game:${gameId}`).emit('tictactoe:player_left', {
          gameId,
          playerId: socket.userId,
          playerName: socket.user.name,
        });

        logger.debug(`User ${socket.userId} left tic-tac-toe game room ${gameId}`);
      } catch (error) {
        logger.error('Error leaving tic-tac-toe game room:', error);
      }
    });

    // Handle game invitations
    socket.on('tictactoe:invite', (data) => {
      try {
        const { gameId, inviteeId } = data;

        // Verify game exists and user is a player
        const game = tictactoeService.getGame(gameId);
        
        if (!game.players.includes(socket.userId)) {
          return socket.emit('error', { message: 'Not a player in this game' });
        }

        // Send invitation to the invitee
        io.to(`user:${inviteeId}`).emit('tictactoe:invitation', {
          gameId,
          from: {
            playerId: socket.userId,
            playerName: socket.user.name,
          },
          game,
        });

        logger.debug(`Tic-tac-toe invitation sent from ${socket.userId} to ${inviteeId} for game ${gameId}`);
      } catch (error) {
        logger.error('Error sending tic-tac-toe invitation:', error);
        socket.emit('error', { message: error.message || 'Failed to send invitation' });
      }
    });
  });

  // Periodic cleanup of old games
  setInterval(() => {
    try {
      tictactoeService.cleanupOldGames();
      logger.debug('Cleaned up old tic-tac-toe games');
    } catch (error) {
      logger.error('Error cleaning up tic-tac-toe games:', error);
    }
  }, 300000); // Clean up every 5 minutes
};