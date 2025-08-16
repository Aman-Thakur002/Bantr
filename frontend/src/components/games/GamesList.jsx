import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Users, Play, Plus } from 'lucide-react';
import * as apiClient from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import useChatStore from '../../stores/useChatStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import TicTacToeGame from './TicTacToeGame';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification, openModal } = useUIStore();
  const { conversations } = useChatStore();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      // This would typically fetch from a games endpoint
      // For now, we'll use mock data
      const mockGames = [
        {
          _id: '1',
          type: 'tictactoe',
          players: [
            { _id: '1', firstName: 'John', lastName: 'Doe', avatar: null },
            { _id: '2', firstName: 'Jane', lastName: 'Smith', avatar: null }
          ],
          status: 'active',
          winner: null,
          createdAt: new Date().toISOString(),
        }
      ];
      setGames(mockGames);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load games',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewGame = async (conversationId, opponent) => {
    try {
      const response = await apiClient.startTicTacToe(conversationId, opponent);
      const newGame = response.data;
      setGames(prev => [newGame, ...prev]);
      setActiveGame(newGame);
      
      addNotification({
        type: 'success',
        title: 'Game started',
        message: 'Tic Tac Toe game has been started!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to start game',
        message: error.message,
      });
    }
  };

  const getGameStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      case 'waiting': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (activeGame) {
    return (
      <div className="h-full">
        <TicTacToeGame 
          game={activeGame} 
          onGameEnd={() => setActiveGame(null)}
          onBack={() => setActiveGame(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Games
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal('gameInvite')}
            className="p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Game Types */}
        <div className="grid grid-cols-2 gap-2">
          <GlassCard className="p-3 text-center hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Tic Tac Toe</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Classic game</p>
          </GlassCard>
          <GlassCard className="p-3 text-center hover:shadow-md transition-all duration-200 cursor-pointer opacity-50">
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">More Games</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
          </GlassCard>
        </div>
      </div>

      {/* Active Games */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Gamepad2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active games
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start a game with your friends!
            </p>
            <Button onClick={() => openModal('gameInvite')}>
              Start New Game
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Active Games
            </h3>
            <div className="space-y-2">
              {games.map((game) => (
                <motion.div
                  key={game._id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setActiveGame(game)}
                >
                  <GlassCard className="p-3 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">🎯</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Tic Tac Toe
                          </h4>
                          <span className={cn('text-xs font-medium', getGameStatusColor(game.status))}>
                            {game.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex -space-x-2">
                            {game.players.map((player) => (
                              <Avatar
                                key={player._id}
                                src={player.avatar}
                                fallback={`${player.firstName?.[0]}${player.lastName?.[0]}`}
                                size="xs"
                                className="ring-2 ring-white dark:ring-gray-800"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            vs {game.players.map(p => p.firstName).join(' vs ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(game.createdAt)}
                        </p>
                        {game.winner && (
                          <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesList;