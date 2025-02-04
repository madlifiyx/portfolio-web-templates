import { useState, useEffect } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { getStackData } from '@/data/data-stack';

export const SkillSection = () => {
  const [stack, setStack] = useState<string[] | null>([]);

  useEffect(() => {
    getStackData().then(setStack);
  }, []);

  return (
    <section
      id='skills'
      className='mb-8'
    >
      <BlurFade
        delay={0.6}
        inView
      >
        <h2 className='text-xl font-bold mb-2'>Skill</h2>
        <div className='flex flex-wrap gap-2'>
          {stack?.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </BlurFade>
    </section>
  );
};
