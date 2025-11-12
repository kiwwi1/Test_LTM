import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const BOARD_SIZE = 10;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const GameBoard = ({ board, onCellClick, isMyBoard, ships, showShips = true }) => {
    const getCellClass = (x, y) => {
        const cellValue = board[x][y];
        let baseClass = 'w-full h-full border border-gray-300 transition-all cursor-pointer hover:bg-blue-100';

        if (isMyBoard) {
            // My board - show ships
            if (cellValue === 1 && showShips) {
                return `${baseClass} bg-gray-400`; // Ship
            } else if (cellValue === 2) {
                return `${baseClass} bg-blue-200`; // Miss
            } else if (cellValue === 3) {
                return `${baseClass} bg-red-500`; // Hit
            }
        } else {
            // Opponent board - hide ships
            if (cellValue === 2) {
                return `${baseClass} bg-blue-200`; // Miss
            } else if (cellValue === 3) {
                return `${baseClass} bg-red-500`; // Hit
            }
        }

        return `${baseClass} bg-blue-50`;
    };

    const getCellContent = (x, y) => {
        const cellValue = board[x][y];
        if (cellValue === 2) return '○'; // Miss
        if (cellValue === 3) return '✕'; // Hit
        return '';
    };

    const handleCellClick = (x, y) => {
        if (onCellClick && !isMyBoard) {
            onCellClick(x, y);
        }
    };

    return (
        <div className="inline-block">
            <div className="grid grid-cols-11 gap-0 bg-white rounded-lg shadow-lg p-4">
                {/* Empty top-left corner */}
                <div className="w-8 h-8"></div>
                
                {/* Column labels (letters) */}
                {LETTERS.map((letter) => (
                    <div key={letter} className="w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {letter}
                    </div>
                ))}

                {/* Rows */}
                {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {/* Row label (number) */}
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {rowIndex + 1}
                        </div>

                        {/* Cells */}
                        {Array.from({ length: BOARD_SIZE }).map((_, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="w-8 h-8"
                            >
                                <div
                                    className={getCellClass(rowIndex, colIndex)}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    <div className="flex items-center justify-center h-full text-lg font-bold">
                                        {getCellContent(rowIndex, colIndex)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default GameBoard;

