import { HeroSection } from './sections/hero-section/hero-section';
import { AboutSection } from './sections/about-section/about-section';
import { WorkSection } from './sections/work-section/work-section';
import { EducationSection } from './sections/education-section/education-section';
import { SkillSection } from './sections/skills-section/skill-section';
import { ProjectSection } from './sections/project-section/project-section';
import { ContactSection } from './sections/contact-section/contact-section';

export const ResumePage = () => {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <EducationSection />
      <SkillSection />
      <ProjectSection />
      <ContactSection />
    </div>
  );
};
