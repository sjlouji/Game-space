import React, { useState, useEffect, useCallback, useMemo } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'menu' | 'playing' | 'solved';
type Cell = {
  value: number | null;
  isGiven: boolean;
  isInvalid: boolean;
};
type Board = Cell[][];
type Position = { row: number; col: number };

const DIFFICULTIES: Record<Difficulty, { label: string; emptyCells: number }> = {
  easy: { label: 'Easy', emptyCells: 35 },
  medium: { label: 'Medium', emptyCells: 45 },
  hard: { label: 'Hard', emptyCells: 55 },
};

const PUZZLES = {
  easy: '..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..',
  medium: '2...8.3...6..7..84.3.5..2.9...1.54.8.........4.27.6...3.1..7.4.72..4..6...4.1...3',
  hard: '85...24..72......9..4.........1.7..23.5...9...4...........8..7..17..........36.4.',
};

const generatePuzzle = (difficulty: Difficulty): { puzzle: Board; solution: number[][] } => {
  const baseString = PUZZLES[difficulty];
  const puzzleBoard: Board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ value: null, isGiven: false, isInvalid: false })));
  const solutionBoard: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
      if (board[i][col] === num) return false;
    }
    const boxRowStart = 3 * Math.floor(row / 3);
    const boxColStart = 3 * Math.floor(col / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRowStart + i][boxColStart + j] === num) return false;
      }
    }
    return true;
  };

  const findBestCell = (board: number[][]): [number, number] | null => {
    let bestRow = -1;
    let bestCol = -1;
    let minPossibilities = 10;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          let count = 0;
          for (let n = 1; n <= 9; n++) {
            if (isValid(board, r, c, n)) count++;
          }
          if (count < minPossibilities) {
            minPossibilities = count;
            bestRow = r;
            bestCol = c;
          }
        }
      }
    }
    return bestRow === -1 ? null : [bestRow, bestCol];
  };

  const solve = (board: number[][]): boolean => {
    const cell = findBestCell(board);
    if (!cell) return true;

    const [r, c] = cell;
    for (let n = 1; n <= 9; n++) {
      if (isValid(board, r, c, n)) {
        board[r][c] = n;
        if (solve(board)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  };

  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const char = baseString[i];
    solutionBoard[row][col] = char === '.' ? 0 : parseInt(char, 10);
  }
  
  const solved = solve(solutionBoard);
  if (!solved) {
    console.error(`Failed to solve ${difficulty} puzzle`);
    throw new Error(`Failed to solve ${difficulty} puzzle`);
  }

  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const char = baseString[i];
    if (char !== '.') {
      const value = parseInt(char, 10);
      puzzleBoard[row][col] = { value, isGiven: true, isInvalid: false };
    }
  }

  return { puzzle: puzzleBoard, solution: solutionBoard };
};

const SudokuScreen: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback((diff: Difficulty) => {
    try {
      const { puzzle, solution } = generatePuzzle(diff);
      setDifficulty(diff);
      setBoard(puzzle);
      setSolution(solution);
      setSelectedCell(null);
      setErrors(0);
      setTimer(0);
      setStatus('playing');
    } catch (error) {
      console.error('Error starting game:', error);
      setStatus('menu');
    }
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);
  
  const checkWin = useCallback((currentBoard: Board) => {
      for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
              if (currentBoard[r][c].value === null || currentBoard[r][c].value !== solution![r][c]) {
                  return false;
              }
          }
      }
      return true;
  }, [solution]);

  const handleNumberInput = useCallback((num: number | null) => {
    if (status !== 'playing' || !board) return;

    if (!selectedCell) {
      const firstEmpty = board.flat().findIndex(c => c.value === null && !c.isGiven);
      if (firstEmpty >= 0 && num !== null) {
        const row = Math.floor(firstEmpty / 9);
        const col = firstEmpty % 9;
        setSelectedCell({ row, col });
        setTimeout(() => {
          const newBoard = JSON.parse(JSON.stringify(board)) as Board;
          const currentCell = newBoard[row][col];
          currentCell.value = num;
          if (solution && solution[row][col] !== num) {
            currentCell.isInvalid = true;
            setErrors(e => e + 1);
          } else {
            currentCell.isInvalid = false;
          }
          setBoard(newBoard);
          if (checkWin(newBoard)) {
            setStatus('solved');
          }
        }, 0);
      }
      return;
    }

    const { row, col } = selectedCell;
    if (board[row][col].isGiven) return;

    const newBoard = JSON.parse(JSON.stringify(board)) as Board;
    const currentCell = newBoard[row][col];
    
    if (num === null) {
        currentCell.value = null;
        currentCell.isInvalid = false;
    } else {
        const wasInvalid = currentCell.isInvalid;
        currentCell.value = num;
        if (solution && solution[row][col] !== num) {
            currentCell.isInvalid = true;
            if (!wasInvalid) {
              setErrors(e => e + 1);
            }
        } else {
            currentCell.isInvalid = false;
        }
    }
    
    setBoard(newBoard);
    
    if (checkWin(newBoard)) {
        setStatus('solved');
    }

  }, [selectedCell, board, solution, status, checkWin]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status !== 'playing' || !selectedCell) return;
    
    let { row, col } = selectedCell;

    switch(e.key) {
        case 'ArrowUp': row = Math.max(0, row - 1); break;
        case 'ArrowDown': row = Math.min(8, row + 1); break;
        case 'ArrowLeft': col = Math.max(0, col - 1); break;
        case 'ArrowRight': col = Math.min(8, col + 1); break;
        case 'Backspace':
        case 'Delete':
            handleNumberInput(null);
            return;
        default:
            if (!isNaN(parseInt(e.key)) && e.key !== '0') {
                handleNumberInput(parseInt(e.key));
            }
            return;
    }
    e.preventDefault();
    setSelectedCell({ row, col });
  }, [status, selectedCell, handleNumberInput]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const selectedValue = selectedCell && board ? board[selectedCell.row][selectedCell.col].value : null;

  const renderBoard = useMemo(() => {
    if (!board) return null;
    return (
      <div className="grid grid-cols-9 gap-0 border-2 border-slate-600 bg-slate-800 rounded-lg p-1 shadow-2xl">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const i = rowIdx * 9 + colIdx;
            const isSelected = selectedCell && selectedCell.row === rowIdx && selectedCell.col === colIdx;
            const isRelated = selectedCell && (
              selectedCell.row === rowIdx || 
              selectedCell.col === colIdx || 
              (Math.floor(selectedCell.row / 3) === Math.floor(rowIdx / 3) && 
               Math.floor(selectedCell.col / 3) === Math.floor(colIdx / 3))
            );
            const isHighlighted = selectedValue && cell.value === selectedValue && cell.value !== null;
            const isBoxBorderRight = colIdx === 2 || colIdx === 5;
            const isBoxBorderBottom = rowIdx === 2 || rowIdx === 5;

            let bgClass = 'bg-slate-800';
            if (isSelected) bgClass = 'bg-sky-600';
            else if (isRelated) bgClass = 'bg-slate-700';
            else if (isHighlighted) bgClass = 'bg-sky-900/50';

            return (
              <div
                key={i}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                  text-xl sm:text-2xl cursor-pointer transition-all duration-150
                  border border-slate-600
                  ${isBoxBorderRight ? 'border-r-2 border-r-slate-500' : ''}
                  ${isBoxBorderBottom ? 'border-b-2 border-b-slate-500' : ''}
                  ${bgClass}
                  hover:bg-slate-600
                  ${isSelected ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-800' : ''}
                `}
                onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
              >
                <span className={`
                  font-bold
                  ${cell.isGiven ? 'text-neutral-200 font-extrabold' : (cell.isInvalid ? 'text-rose-500' : 'text-sky-400')}
                  ${cell.value ? 'animate-pulse' : ''}
                `}>
                  {cell.value || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    );
  }, [board, selectedCell, selectedValue]);

  return (
    <div className="w-full flex-grow flex flex-col items-center justify-center animate-fade-in p-4 max-w-6xl mx-auto">
      <div className="w-full mb-6 flex justify-between items-center gap-4">
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700 flex-1">
          <div className="text-sm text-neutral-400">Time</div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            {status === 'playing' ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` : '0:00'}
          </div>
        </div>
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700 flex-1">
          <div className="text-sm text-neutral-400">Errors</div>
          <div className="text-2xl font-bold font-mono text-rose-500">{errors}</div>
        </div>
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700 flex-1">
          <div className="text-sm text-neutral-400 mb-2">Difficulty</div>
          {status === 'menu' ? (
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => {
                  const newDiff = e.target.value as Difficulty;
                  setDifficulty(newDiff);
                }}
                className="appearance-none bg-slate-800 border border-slate-600 text-emerald-400 px-4 py-2.5 pr-10 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-750 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full shadow-sm"
              >
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map(diff => (
                  <option key={diff} value={diff} className="bg-slate-800 text-emerald-400">
                    {DIFFICULTIES[diff].label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-emerald-400 capitalize">{difficulty}</div>
          )}
        </div>
      </div>

      {status === 'menu' ? (
        <div className="w-full flex flex-col items-center gap-8">
          <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
            <h2 className="text-4xl font-bold text-sky-400 mb-6 font-heading text-center">Sudoku</h2>
            <p className="text-lg font-semibold text-neutral-300 mb-6 text-center">Select difficulty above and click "Start Game"</p>
            <button 
              onClick={() => startGame(difficulty)} 
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 px-6 rounded-md transition-all duration-200 text-xl active:scale-95"
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 w-full">
          <div className="relative flex-shrink-0">
            {renderBoard}
            {status === 'solved' && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-950/90 backdrop-blur-sm rounded-lg animate-fade-in z-50">
                <div className="bg-slate-900 p-8 rounded-lg shadow-2xl text-center animate-slide-up border border-slate-700">
                  <h2 className="text-4xl font-bold text-amber-400 mb-4">🎉 You Win!</h2>
                  <p className="text-lg text-neutral-400 mb-2">Completed in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                  <p className="text-sm text-neutral-500 mb-6">Errors: {errors}</p>
                  <div className="flex gap-3">
                    <button onClick={() => startGame(difficulty)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-200 text-lg active:scale-95">
                      Play Again
                    </button>
                    <button onClick={() => setStatus('menu')} className="bg-slate-700 hover:bg-slate-600 text-neutral-50 font-bold py-3 px-6 rounded-md transition-all duration-200 text-lg active:scale-95">
                      Change Difficulty
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs lg:w-56">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <div className="text-sm text-neutral-400 mb-3 text-center">Number Pad</div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => {
                      if (!selectedCell) {
                        const firstEmpty = board?.flat().findIndex(c => c.value === null && !c.isGiven);
                        if (firstEmpty !== undefined && firstEmpty >= 0) {
                          setSelectedCell({ row: Math.floor(firstEmpty / 9), col: firstEmpty % 9 });
                          setTimeout(() => handleNumberInput(i + 1), 0);
                        }
                      } else {
                        handleNumberInput(i + 1);
                      }
                    }}
                    disabled={status !== 'playing'}
                    className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-md text-2xl font-bold flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-sky-500"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  if (selectedCell) handleNumberInput(null);
                }}
                disabled={status !== 'playing' || !selectedCell}
                className="w-full mt-2 h-12 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-md text-lg font-bold flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-700"
              >
                Erase
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => startGame(difficulty)} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-2.5 px-4 rounded-md transition-all duration-200 active:scale-95"
              >
                New Game
              </button>
              <button 
                onClick={() => setStatus('menu')} 
                className="w-full bg-slate-700 hover:bg-slate-600 text-neutral-50 font-bold py-2.5 px-4 rounded-md transition-all duration-200 active:scale-95 border border-slate-600"
              >
                Change Difficulty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuScreen;
