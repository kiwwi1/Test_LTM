import React, { useState } from 'react';
import toast from 'react-hot-toast';

const BOARD_SIZE = 10;
const SHIPS = [
    { name: 'Carrier', size: 5, icon: '🚢' },
    { name: 'Battleship', size: 4, icon: '⛴️' },
    { name: 'Cruiser', size: 3, icon: '🛥️' },
    { name: 'Submarine', size: 3, icon: '🚤' },
    { name: 'Destroyer', size: 2, icon: '⛵' },
];

const ShipPlacement = ({ onComplete }) => {
    const [board, setBoard] = useState(
        Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))
    );
    const [placedShips, setPlacedShips] = useState([]);
    const [selectedShip, setSelectedShip] = useState(0);
    const [direction, setDirection] = useState('horizontal'); // 'horizontal' or 'vertical'
    const [previewCells, setPreviewCells] = useState([]);

    const canPlaceShip = (x, y, ship, dir) => {
        const positions = [];
        
        for (let i = 0; i < ship.size; i++) {
            const newX = dir === 'horizontal' ? x : x + i;
            const newY = dir === 'horizontal' ? y + i : y;

            // Check bounds
            if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) {
                return { valid: false, positions: [] };
            }

            // Check if cell is occupied
            if (board[newX][newY] === 1) {
                return { valid: false, positions: [] };
            }

            positions.push([newX, newY]);
        }

        return { valid: true, positions };
    };

    const handleMouseEnter = (x, y) => {
        if (selectedShip >= SHIPS.length) return;

        const ship = SHIPS[selectedShip];
        const { valid, positions } = canPlaceShip(x, y, ship, direction);

        if (valid) {
            setPreviewCells(positions);
        } else {
            setPreviewCells([]);
        }
    };

    const handleMouseLeave = () => {
        setPreviewCells([]);
    };

    const handleCellClick = (x, y) => {
        if (selectedShip >= SHIPS.length) {
            toast.error('All ships have been placed');
            return;
        }

        const ship = SHIPS[selectedShip];
        const { valid, positions } = canPlaceShip(x, y, ship, direction);

        if (!valid) {
            toast.error('Cannot place ship here');
            return;
        }

        // Place ship
        const newBoard = board.map(row => [...row]);
        positions.forEach(([px, py]) => {
            newBoard[px][py] = 1;
        });

        setBoard(newBoard);
        setPlacedShips([
            ...placedShips,
            {
                name: ship.name,
                size: ship.size,
                positions: positions,
            },
        ]);
        setSelectedShip(selectedShip + 1);
        setPreviewCells([]);

        toast.success(`${ship.name} placed!`);
    };

    const handleReset = () => {
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)));
        setPlacedShips([]);
        setSelectedShip(0);
        setPreviewCells([]);
    };

    const handleComplete = () => {
        if (placedShips.length !== SHIPS.length) {
            toast.error('Please place all ships first');
            return;
        }

        onComplete(placedShips);
    };

    const getCellClass = (x, y) => {
        const isPreview = previewCells.some(([px, py]) => px === x && py === y);
        const hasShip = board[x][y] === 1;

        let baseClass = 'w-8 h-8 border border-gray-300 transition-all cursor-pointer';

        if (hasShip) {
            return `${baseClass} bg-gray-600`;
        } else if (isPreview) {
            return `${baseClass} bg-green-300 hover:bg-green-400`;
        } else {
            return `${baseClass} bg-blue-50 hover:bg-blue-100`;
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Place Your Ships</h2>
                <p className="text-gray-600">
                    Click on the board to place your ships
                </p>
            </div>

            <div className="flex gap-8">
                {/* Board */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-10 gap-0">
                        {Array.from({ length: BOARD_SIZE }).map((_, x) =>
                            Array.from({ length: BOARD_SIZE }).map((_, y) => (
                                <div
                                    key={`${x}-${y}`}
                                    className={getCellClass(x, y)}
                                    onClick={() => handleCellClick(x, y)}
                                    onMouseEnter={() => handleMouseEnter(x, y)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Ship list */}
                <div className="bg-white rounded-lg shadow-lg p-6 w-64">
                    <h3 className="font-bold text-lg mb-4">Ships</h3>
                    <div className="space-y-2">
                        {SHIPS.map((ship, index) => (
                            <div
                                key={ship.name}
                                className={`p-3 rounded-lg border-2 ${
                                    index === selectedShip
                                        ? 'border-blue-500 bg-blue-50'
                                        : index < selectedShip
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl">{ship.icon}</span>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm">{ship.name}</p>
                                        <p className="text-xs text-gray-500">Size: {ship.size}</p>
                                    </div>
                                </div>
                                {index < selectedShip && (
                                    <p className="text-xs text-green-600 mt-1">✓ Placed</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => setDirection(direction === 'horizontal' ? 'vertical' : 'horizontal')}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Direction: {direction === 'horizontal' ? '→' : '↓'}
                        </button>

                        <button
                            onClick={handleReset}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Reset
                        </button>

                        <button
                            onClick={handleComplete}
                            disabled={placedShips.length !== SHIPS.length}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Ready!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipPlacement;

