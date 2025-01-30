import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';

interface SkillSectionProps {
  skills?: string[];
}

const defaultSkills = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Tailwind CSS',
  'Git',
  'GitHub',
];

export const SkillSection: React.FC<SkillSectionProps> = ({
  skills = defaultSkills,
}) => {
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
          {skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </BlurFade>
    </section>
  );
};
