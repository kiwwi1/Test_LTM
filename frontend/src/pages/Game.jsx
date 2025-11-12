import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import GameBoard from '../components/GameBoard';
import ShipPlacement from '../components/ShipPlacement';
import toast from 'react-hot-toast';

const BOARD_SIZE = 10;

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuth();

    const gameData = location.state;
    const [gamePhase, setGamePhase] = useState('placement'); // placement, playing, finished
    const [myBoard, setMyBoard] = useState(createEmptyBoard());
    const [opponentBoard, setOpponentBoard] = useState(createEmptyBoard());
    const [myShips, setMyShips] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        if (!gameData || !socket) {
            navigate('/');
            return;
        }

        // Listen to game events
        socket.on('game:ships_placed', handleShipsPlaced);
        socket.on('game:both_ready', handleBothReady);
        socket.on('game:attack_result', handleAttackResult);
        socket.on('game:ended', handleGameEnded);
        socket.on('game:chat_message', handleChatMessage);

        return () => {
            if (socket) {
                socket.off('game:ships_placed');
                socket.off('game:both_ready');
                socket.off('game:attack_result');
                socket.off('game:ended');
                socket.off('game:chat_message');
            }
        };
    }, [socket, gameData, navigate]);

    function createEmptyBoard() {
        return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    }

    const handleShipPlacementComplete = (ships) => {
        // Place ships on board
        const newBoard = createEmptyBoard();
        ships.forEach(ship => {
            ship.positions.forEach(([x, y]) => {
                newBoard[x][y] = 1;
            });
        });

        setMyBoard(newBoard);
        setMyShips(ships);

        // Send to server
        if (socket) {
            socket.emit('game:place_ships', {
                roomId: gameData.roomId,
                ships: ships,
            });
        }

        toast.success('Ships placed! Waiting for opponent...');
    };

    const handleShipsPlaced = () => {
        // Confirmation from server
    };

    const handleBothReady = (data) => {
        setGamePhase('playing');
        setCurrentTurn(data.currentTurn);
        toast.success('Game started! Battle begins!');
    };

    const handleCellClick = (x, y) => {
        if (gamePhase !== 'playing') return;
        if (currentTurn !== user?.id) {
            toast.error('Not your turn!');
            return;
        }

        // Check if already attacked
        if (opponentBoard[x][y] !== 0) {
            toast.error('Already attacked this position!');
            return;
        }

        // Send attack
        if (socket) {
            socket.emit('game:attack', {
                roomId: gameData.roomId,
                x,
                y,
            });
        }
    };

    const handleAttackResult = (data) => {
        const { attackerId, coord, hit, sunkShip, gameOver, winner } = data;

        if (attackerId === user?.id) {
            // My attack
            const newBoard = [...opponentBoard];
            newBoard[coord.x][coord.y] = hit ? 3 : 2;
            setOpponentBoard(newBoard);

            if (hit) {
                toast.success(sunkShip ? `Hit! ${sunkShip} destroyed!` : 'Hit!');
            } else {
                toast.info('Miss!');
            }
        } else {
            // Opponent's attack
            const newBoard = [...myBoard];
            newBoard[coord.x][coord.y] = hit ? 3 : 2;
            setMyBoard(newBoard);

            if (hit) {
                toast.error(sunkShip ? `Your ${sunkShip} was destroyed!` : 'Enemy hit your ship!');
            } else {
                toast.success('Enemy missed!');
            }
        }

        // Update turn
        if (!gameOver) {
            setCurrentTurn(attackerId === user?.id ? 
                (gameData.player1Id === user?.id ? gameData.player2Id : gameData.player1Id) : 
                user?.id
            );
        } else {
            setGameResult(winner === user?.id ? 'win' : 'lose');
            setGamePhase('finished');
        }
    };

    const handleGameEnded = (data) => {
        const { winner, reason, eloChanges } = data;
        
        if (winner === user?.id) {
            toast.success(`You won! +${eloChanges.winner.change} ELO`);
            setGameResult('win');
        } else {
            toast.error(`You lost! ${eloChanges.loser.change} ELO`);
            setGameResult('lose');
        }

        if (reason === 'surrender') {
            toast.info('Opponent surrendered');
        } else if (reason === 'disconnect') {
            toast.info('Opponent disconnected');
        }

        setGamePhase('finished');
    };

    const handleSurrender = () => {
        if (window.confirm('Are you sure you want to surrender?')) {
            if (socket) {
                socket.emit('game:surrender', {
                    roomId: gameData.roomId,
                });
            }
        }
    };

    const handleSendChat = () => {
        if (chatInput.trim() && socket) {
            socket.emit('game:chat', {
                roomId: gameData.roomId,
                message: chatInput.trim(),
            });
            setChatInput('');
        }
    };

    const handleChatMessage = (data) => {
        setChatMessages(prev => [...prev, data]);
    };

    const handleBackToLobby = () => {
        navigate('/');
    };

    if (gamePhase === 'placement') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-8">
                <div className="container mx-auto">
                    <ShipPlacement onComplete={handleShipPlacementComplete} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">BattleShip Battle</h1>
                        <p className="text-gray-600">
                            {gamePhase === 'playing' && (
                                currentTurn === user?.id ? 
                                <span className="text-green-600 font-semibold">Your Turn</span> :
                                <span className="text-orange-600 font-semibold">Opponent's Turn</span>
                            )}
                            {gamePhase === 'finished' && (
                                <span className={`font-bold ${gameResult === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                                    {gameResult === 'win' ? 'Victory!' : 'Defeat!'}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        {gamePhase === 'playing' && (
                            <button
                                onClick={handleSurrender}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Surrender
                            </button>
                        )}
                        {gamePhase === 'finished' && (
                            <button
                                onClick={handleBackToLobby}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Lobby
                            </button>
                        )}
                    </div>
                </div>

                {/* Game boards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* My board */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Fleet</h2>
                        <GameBoard board={myBoard} isMyBoard={true} ships={myShips} />
                    </div>

                    {/* Opponent board */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Enemy Waters</h2>
                        <GameBoard 
                            board={opponentBoard} 
                            isMyBoard={false}
                            onCellClick={handleCellClick}
                            showShips={false}
                        />
                    </div>
                </div>

                {/* Chat */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Chat</h2>
                    <div className="h-32 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className="mb-2">
                                <span className={`font-semibold ${msg.userId === user?.id ? 'text-blue-600' : 'text-red-600'}`}>
                                    {msg.username}:
                                </span>
                                <span className="ml-2 text-gray-700">{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSendChat}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;

