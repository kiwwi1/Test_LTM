import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PlayerList = ({ onChallenge }) => {
    const { onlinePlayers } = useSocket();
    const { user } = useAuth();

    const handleChallenge = (player) => {
        if (onChallenge) {
            onChallenge(player);
        }
    };

    const filteredPlayers = onlinePlayers.filter((p) => p.id !== user?.id && p.status === 'ONLINE');

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">👥</span>
                Online Players ({filteredPlayers.length})
            </h2>

            {filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No players online</p>
                    <p className="text-sm mt-2">Waiting for opponents...</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPlayers.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {player.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{player.username}</p>
                                    <p className="text-sm text-gray-500">
                                        ELO: {player.eloRating} | W: {player.wins} L: {player.losses}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleChallenge(player)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Challenge
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayerList;

