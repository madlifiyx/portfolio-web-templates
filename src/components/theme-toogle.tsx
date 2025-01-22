import { IconMoonStars, IconSunHigh } from '@tabler/icons-react';
import { useTheme } from '@/stores/theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToogle() {
  const { setTheme, theme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <div className='flex items-center justify-center'>
            {theme === 'dark' ? (
              <IconSunHigh
                size={22}
                color='yellow'
                onClick={() => setTheme('light')}
              />
            ) : (
              <IconMoonStars
                size={22}
                color='gray'
                onClick={() => setTheme('dark')}
              />
            )}
          </div>
          <h6
            className={`text-xs mt-0.5 lg:hidden ${
              theme === 'dark' ? 'text-amber-200' : 'text-gray-500'
            }`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </h6>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </TooltipContent>
    </Tooltip>
  );
}
