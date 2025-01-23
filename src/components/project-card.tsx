import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const stack = ['HTML', 'CSS', 'TypeScript', 'React', 'Vite', 'Tailwind CSS'];

export const ProjectCard = () => {
  return (
    <Card className='flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full'>
      <video
        src={'https://www.w3schools.com/html/mov_bbb.mp4'}
        autoPlay
        loop
        muted
        playsInline
        className='pointer-events-none mx-auto h-40 w-full object-cover object-top' // needed because random black line at bottom of video
      />
      <CardHeader className='px-2 pt-3'>
        <CardTitle>Project Name</CardTitle>
        <time className='font-sans text-xs italic'>June 2023 - Present</time>
        <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type
          and.Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
        </p>
      </CardHeader>
      <CardContent className='px-2 -mt-5'>
        <div className='mt-2 flex flex-wrap gap-1'>
          {stack.map((item) => (
            <Badge
              key={item}
              className='px-1 py-0 text-[11px]'
              variant='secondary'
            >
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className='px-2 pb-3 -mt-3'>
        <Badge className='cursor-pointer'>Badge</Badge>
      </CardFooter>
    </Card>
  );
};
