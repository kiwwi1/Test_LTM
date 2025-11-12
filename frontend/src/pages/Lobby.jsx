import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import PlayerList from '../components/PlayerList';
import { userAPI } from '../config/api';
import toast from 'react-hot-toast';

const Lobby = () => {
    const { user, logout } = useAuth();
    const { socket, connected } = useSocket();
    const [leaderboard, setLeaderboard] = useState([]);
    const [showChallenge, setShowChallenge] = useState(false);
    const [challengeFrom, setChallengeFrom] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load leaderboard
        loadLeaderboard();

        // Listen for challenges
        if (socket) {
            socket.on('game:challenge_received', handleChallengeReceived);
            socket.on('game:challenge_sent', () => {
                toast.success('Challenge sent!');
            });
            socket.on('game:challenge_declined', () => {
                toast.error('Challenge declined');
            });
            socket.on('game:started', handleGameStarted);
        }

        return () => {
            if (socket) {
                socket.off('game:challenge_received');
                socket.off('game:challenge_sent');
                socket.off('game:challenge_declined');
                socket.off('game:started');
            }
        };
    }, [socket]);

    const loadLeaderboard = async () => {
        try {
            const response = await userAPI.getLeaderboard(10);
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    };

    const handleChallengeReceived = (data) => {
        setChallengeFrom(data);
        setShowChallenge(true);
        toast.info(`Challenge from ${data.challengerName}!`);
    };

    const handleChallenge = (player) => {
        if (socket && connected) {
            socket.emit('game:challenge', { targetUserId: player.id });
        } else {
            toast.error('Not connected to server');
        }
    };

    const handleChallengeResponse = (accepted) => {
        if (socket && challengeFrom) {
            socket.emit('game:challenge_response', {
                challengerId: challengeFrom.challengerId,
                accepted,
            });

            if (accepted) {
                toast.success('Challenge accepted! Starting game...');
            } else {
                toast.info('Challenge declined');
            }

            setShowChallenge(false);
            setChallengeFrom(null);
        }
    };

    const handleGameStarted = (data) => {
        toast.success('Game started!');
        navigate('/game', { state: data });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user?.username}</h1>
                            <p className="text-gray-600">
                                ELO: {user?.eloRating} | Wins: {user?.wins} | Losses: {user?.losses}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 ${connected ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></div>
                            <span className="font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Player list */}
                <div className="lg:col-span-2">
                    <PlayerList onChallenge={handleChallenge} />
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🏆</span>
                        Leaderboard
                    </h2>
                    <div className="space-y-2">
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.user.id}
                                className={`p-3 rounded-lg ${
                                    entry.user.id === user?.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl font-bold text-gray-400">#{entry.rank}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">{entry.user.username}</p>
                                            <p className="text-xs text-gray-500">
                                                {entry.eloRating} ELO • {entry.winRate.toFixed(1)}% WR
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Challenge Modal */}
            {showChallenge && challengeFrom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge Received!</h2>
                        <p className="text-gray-600 mb-6">
                            <span className="font-semibold">{challengeFrom.challengerName}</span> (ELO: {challengeFrom.challengerElo})
                            wants to challenge you to a battle!
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleChallengeResponse(true)}
                                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleChallengeResponse(false)}
                                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;

