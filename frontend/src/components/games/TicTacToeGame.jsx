import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Users } from 'lucide-react';
import { apiClient } from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import useAuthStore from '../../stores/useAuthStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const TicTacToeGame = ({ game, onGameEnd, onBack }) => {
  const [gameState, setGameState] = useState(game);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (gameState.state) {
      setBoard(gameState.state.board || Array(9).fill(null));
      setCurrentPlayer(gameState.state.currentPlayer || 'X');
      setWinner(gameState.winner);
      setIsGameOver(gameState.status === 'completed');
    }
  }, [gameState]);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return null;
  };

  const handleCellClick = async (index) => {
    if (board[index] || isGameOver) return;
    
    try {
      const response = await apiClient.makeMove(gameState._id, index);
      const updatedGame = response.data;
      
      setGameState(updatedGame);
      
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);
      
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setIsGameOver(true);
        onGameEnd();
      } else if (newBoard.every(cell => cell !== null)) {
        setIsGameOver(true);
        onGameEnd();
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Invalid move',
        message: error.message,
      });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsGameOver(false);
  };

  const getPlayerSymbol = (playerId) => {
    return playerId === gameState.players[0]._id ? 'X' : 'O';
  };

  const getCurrentPlayerName = () => {
    const playerIndex = currentPlayer === 'X' ? 0 : 1;
    const player = gameState.players[playerIndex];
    return `${player.firstName} ${player.lastName}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tic Tac Toe
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              className="p-2"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between">
          {gameState.players.map((player, index) => (
            <div key={player._id} className="flex items-center space-x-2">
              <Avatar
                src={player.avatar}
                fallback={`${player.firstName?.[0]}${player.lastName?.[0]}`}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {player.firstName} {player.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Playing {index === 0 ? 'X' : 'O'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Game Status */}
          <GlassCard className="p-4 mb-6 text-center">
            {winner ? (
              <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">
                  {winner === 'X' ? gameState.players[0].firstName : gameState.players[1].firstName} Wins!
                </span>
              </div>
            ) : isGameOver ? (
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                It's a Draw!
              </span>
            ) : (
              <span className="text-gray-900 dark:text-white font-semibold">
                {getCurrentPlayerName()}'s Turn ({currentPlayer})
              </span>
            )}
          </GlassCard>

          {/* Board */}
          <GlassCard className="p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-2">
              {board.map((cell, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: cell ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCellClick(index)}
                  disabled={cell !== null || isGameOver}
                  className="aspect-square bg-white/20 dark:bg-white/10 rounded-lg border border-white/30 dark:border-white/20 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-white/20 transition-colors disabled:cursor-not-allowed"
                >
                  {cell && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cell === 'X' ? 'text-blue-500' : 'text-red-500'}
                    >
                      {cell}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          {isGameOver && (
            <div className="mt-6 flex justify-center">
              <Button onClick={resetGame} className="px-6">
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;