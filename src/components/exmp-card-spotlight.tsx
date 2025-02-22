import React from 'react';
import { useTheme } from '@/stores/theme-provider';

export const ExmpCardSpotlight = () => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className='relative max-w-md overflow-hidden rounded-xl border bg-gradient-to-r from-gray-200 to-white dark:from-slate-900 dark:to-slate-950 px-8 py-16 shadow-2xl'
    >
      <div
        className='pointer-events-none absolute -inset-px opacity-0 transition duration-300'
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${
            position.y
          }px, ${
            theme === 'dark' ? 'rgba(255,255,235,.1)' : 'rgba(0,0,2,0.1)'
          }, transparent 25%)`,
        }}
      />
      <span className='mb-4 inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg'>
        <svg
          className='h-6 w-6 text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          aria-hidden='true'
        />
      </span>
      <h3 className='mb-2 font-medium tracking-tight text-black dark:text-white'>
        Hello!
      </h3>
      <p className='text-sm text-gray-600 dark:text-slate-400'>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit ex
        obcaecati natus eligendi delectus, cum deleniti sunt in labore nihil
        quod quibusdam expedita nemo.
      </p>
    </div>
  );
};
