
import React from 'react';

export type GameId = '2048' | 'dino' | 'stickman' | 'bouncing-ball' | 'tic-tac-toe' | 'block-fall' | 'stack' | 'minesweeper' | 'snake' | 'connect-four' | 'flappy-bird' | 'sudoku' | 'memory-match' | 'typing-practice';
export type GameCategory = 'Puzzle' | 'Strategy' | 'Classic' | 'Arcade' | 'Endless Runner' | 'Skill' | 'Memory';

export interface Game {
  id: GameId;
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
  visual: React.ReactNode;
  categories: GameCategory[];
}

// FIX: Replaced JSX with React.createElement to be valid in a .ts file
export const GAMES: Game[] = [
  {
    id: 'typing-practice',
    title: 'Typing Master',
    description: 'Adaptive typing practice that focuses on your weak keys and combinations.',
    status: 'available',
    categories: ['Skill', 'Classic'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-20 p-2 flex items-center justify-center' },
      React.createElement('div', { className: 'text-4xl font-mono text-sky-400' }, '⌨️')
    ),
  },
  {
    id: '2048',
    title: '2048',
    description: 'Join the numbers to get the 2048 tile!',
    status: 'available',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    visual: React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-2 w-24 h-24' },
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
      React.createElement('div', { className: 'bg-amber-400 rounded-md' }),
      React.createElement('div', { className: 'bg-rose-400 rounded-md' }),
      React.createElement('div', { className: 'bg-slate-400 rounded-md' })
    ),
  },
  {
    id: 'dino',
    title: 'Pixel Dino Run',
    description: 'Jump over obstacles and run as far as you can!',
    status: 'available',
    categories: ['Arcade', 'Endless Runner'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-16 relative' },
      React.createElement(
        'div',
        { className: 'absolute bottom-2 left-0 w-full h-px bg-slate-400' },
        React.createElement('div', { className: 'absolute top-0 left-[10%] w-1 h-0.5 bg-slate-400' }),
        React.createElement('div', { className: 'absolute top-0 left-[40%] w-2 h-0.5 bg-slate-400' }),
        React.createElement('div', { className: 'absolute top-0 left-[75%] w-1 h-0.5 bg-slate-400' })
      ),
      React.createElement(
        'div',
        { className: 'absolute bottom-[0.6rem] left-2 w-6 h-7 bg-sky-400 rounded-lg' },
        React.createElement('div', { className: 'absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-slate-900 rounded-full' })
      ),
      React.createElement(
        'div',
        { className: 'absolute bottom-[0.6rem] right-4 w-4 h-5 bg-emerald-400 rounded-md' }
      )
    ),
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic Xs and Os. Can you get three in a row?',
    status: 'available',
    categories: ['Classic', 'Puzzle', 'Strategy'],
    visual: React.createElement(
      'div',
      { className: 'w-20 h-20 grid grid-cols-3 grid-rows-3 relative' },
       React.createElement('div', { className: 'flex items-center justify-center text-sky-400 text-3xl font-bold' }, 'X'),
      React.createElement('div', {}),
      React.createElement('div', { className: 'flex items-center justify-center text-rose-400 text-3xl font-bold' }, 'O'),
      React.createElement('div', { className: 'flex items-center justify-center text-rose-400 text-3xl font-bold' }, 'O'),
      React.createElement('div', { className: 'flex items-center justify-center text-sky-400 text-3xl font-bold' }, 'X'),
      React.createElement('div', {}),
      React.createElement('div', {}),
      React.createElement('div', { className: 'flex items-center justify-center text-sky-400 text-3xl font-bold' }, 'X'),
      React.createElement('div', { className: 'flex items-center justify-center text-rose-400 text-3xl font-bold' }, 'O'),
      React.createElement('div', { className: 'absolute top-0 left-[33.33%] w-0.5 h-full bg-slate-600' }),
      React.createElement('div', { className: 'absolute top-0 left-[66.66%] w-0.5 h-full bg-slate-600' }),
      React.createElement('div', { className: 'absolute left-0 top-[33.33%] h-0.5 w-full bg-slate-600' }),
      React.createElement('div', { className: 'absolute left-0 top-[66.66%] h-0.5 w-full bg-slate-600' }),
    )
  },
  {
    id: 'block-fall',
    title: 'Block Fall',
    description: 'Classic falling block puzzle. Clear lines to score!',
    status: 'available',
    categories: ['Classic', 'Puzzle', 'Arcade'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-24 p-2 grid grid-cols-4 grid-rows-4 gap-1' },
      // T piece (purple)
      React.createElement('div', { className: 'col-start-1 col-span-3 bg-purple-400 rounded-sm' }),
      React.createElement('div', { className: 'row-start-2 col-start-2 bg-purple-400 rounded-sm' }),
      // S piece (green)
      React.createElement('div', { className: 'row-start-3 col-start-2 col-span-2 bg-emerald-400 rounded-sm' }),
      React.createElement('div', { className: 'row-start-4 col-start-1 col-span-2 bg-emerald-400 rounded-sm' }),
    )
  },
  {
    id: 'stack',
    title: 'Stack Tower',
    description: 'Tap to place blocks and build the tallest tower!',
    status: 'available',
    categories: ['Arcade', 'Skill'],
    visual: React.createElement(
      'div',
      { style: { perspective: '100px' }, className: 'w-20 h-20 flex items-end justify-center' },
      React.createElement(
        'div',
        { style: { transform: 'rotateX(20deg)', transformStyle: 'preserve-3d' }, className: 'relative w-full h-full' },
        React.createElement('div', { style: { position: 'absolute', bottom: '10px', left: '10%', width: '80%', height: '1rem', backgroundColor: '#38bdf8' }, className: 'rounded-sm' }),
        React.createElement('div', { style: { position: 'absolute', bottom: 'calc(10px + 1rem)', left: '15%', width: '70%', height: '1rem', backgroundColor: '#4ade80' }, className: 'rounded-sm' }),
        React.createElement('div', { style: { position: 'absolute', bottom: 'calc(10px + 2rem)', left: '20%', width: '60%', height: '1rem', backgroundColor: '#facc15' }, className: 'rounded-sm' }),
        React.createElement('div', { style: { position: 'absolute', bottom: 'calc(10px + 3rem)', left: '25%', width: '50%', height: '1rem', backgroundColor: '#fb7185' }, className: 'rounded-sm' })
      )
    )
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Clear the board without hitting any mines. A true classic!',
    status: 'available',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-24 p-2 grid grid-cols-4 grid-rows-4 gap-1' },
      React.createElement('div', { className: 'bg-slate-700 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm flex items-center justify-center text-sky-400 font-bold' }, '1'),
      React.createElement('div', { className: 'bg-slate-700 rounded-sm flex items-center justify-center text-sm' }, '🚩'),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm flex items-center justify-center text-emerald-400 font-bold' }, '2'),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-sm' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-sm flex items-center justify-center text-sm' }, '🚩'),
      React.createElement('div', { className: 'bg-slate-600 rounded-sm' }),
    )
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Eat the food, grow your snake, and avoid the walls!',
    status: 'available',
    categories: ['Arcade', 'Classic', 'Skill'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-20 p-2 relative' },
      React.createElement('div', { className: 'absolute top-8 left-4 w-4 h-4 bg-emerald-400 rounded-sm' }),
      React.createElement('div', { className: 'absolute top-8 left-8 w-4 h-4 bg-emerald-400 rounded-sm' }),
      React.createElement('div', { className: 'absolute top-8 left-12 w-4 h-4 bg-emerald-400 rounded-sm' }),
      React.createElement('div', { className: 'absolute top-4 left-12 w-4 h-4 bg-emerald-400 rounded-sm' }),
      React.createElement('div', { className: 'absolute top-12 right-6 w-3 h-3 bg-rose-400 rounded-full' })
    )
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    description: 'Drop your discs and be the first to get four in a row!',
    status: 'available',
    categories: ['Strategy', 'Classic', 'Puzzle'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-20 p-2 grid grid-cols-5 gap-1' },
      // Simple representation
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-yellow-400 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      // row 2
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-yellow-400 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      // row 3
      React.createElement('div', { className: 'bg-yellow-400 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-yellow-400 rounded-full' }),
       // row 4
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
      React.createElement('div', { className: 'bg-yellow-400 rounded-full' }),
      React.createElement('div', { className: 'bg-rose-500 rounded-full' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-full' }),
    )
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Tap to flap your way through the pipes. How far can you get?',
    status: 'available',
    categories: ['Arcade', 'Skill'],
    visual: React.createElement(
      'div',
      { className: 'w-24 h-20 p-2 relative overflow-hidden flex items-center' },
      React.createElement('div', { className: 'w-full h-full bg-sky-300' }),
      // Bird
      React.createElement('div', { className: 'absolute top-[45%] left-4 w-6 h-5 bg-yellow-400 rounded-md -rotate-12 border-2 border-slate-900' }),
      // Pipe
      React.createElement('div', { className: 'absolute top-0 right-4 w-8 h-[35%] bg-emerald-500 border-x-2 border-t-2 border-slate-900' }),
      React.createElement('div', { className: 'absolute bottom-0 right-4 w-8 h-[35%] bg-emerald-500 border-x-2 border-b-2 border-slate-900' })
    )
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'A classic logic puzzle. Fill the grid with numbers 1-9.',
    status: 'coming-soon',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    visual: React.createElement(
      'div', { className: 'w-20 h-20 grid grid-cols-3 grid-rows-3 gap-0.5 bg-slate-600 p-1 rounded' },
      ...Array.from({ length: 9 }).map((_, i) =>
        React.createElement('div', {
          key: i,
          className: 'bg-slate-800 flex items-center justify-center text-sky-400/50 text-xs',
        }, ((i * 3) % 8 + 1))
      )
    ),
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find all the matching pairs. Test your recall!',
    status: 'coming-soon',
    categories: ['Memory', 'Puzzle', 'Classic'],
    visual: React.createElement(
      'div', { className: 'w-24 h-20 p-2 grid grid-cols-4 grid-rows-2 gap-2' },
      React.createElement('div', { className: 'bg-sky-500 rounded-md text-2xl flex items-center justify-center' }, '🧠'),
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
      React.createElement('div', { className: 'bg-sky-500 rounded-md text-2xl flex items-center justify-center' }, '🧠'),
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
      React.createElement('div', { className: 'bg-emerald-500 rounded-md text-2xl flex items-center justify-center' }, '🕹️'),
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
      React.createElement('div', { className: 'bg-slate-700 rounded-md' }),
    ),
  },
  {
    id: 'stickman',
    title: 'Stickman Hook',
    description: 'Swing through levels with your grappling hook!',
    status: 'coming-soon',
    categories: ['Arcade', 'Skill'],
    visual: React.createElement(
      'div',
      { className: 'w-16 h-16 relative' },
      React.createElement('div', { className: 'absolute top-[-0.5rem] left-[3.2rem] w-12 h-0.5 bg-slate-600 transform -rotate-45 origin-top-left' }),
      React.createElement(
        'div',
        { className: 'absolute bottom-2 left-2 transform -rotate-45' },
        React.createElement('div', { className: 'w-5 h-5 rounded-full bg-sky-400' }),
        React.createElement('div', { className: 'absolute top-4 left-2 w-0.5 h-6 bg-sky-400' })
      )
    ),
  },
    {
    id: 'bouncing-ball',
    title: 'Bouncing Ball',
    description: 'Navigate your ball through tricky obstacles.',
    status: 'coming-soon',
    categories: ['Arcade', 'Skill'],
    visual: React.createElement(
      'div',
      { className: 'w-16 h-16 relative' },
      React.createElement('div', { className: 'absolute top-3 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-rose-400' }),
      React.createElement('div', { className: 'absolute bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-slate-800 rounded-full opacity-75 blur-sm' })
    ),
  },
];