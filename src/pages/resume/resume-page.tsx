import { HeroSection } from './sections/hero-section/hero-section';
import { AboutSection } from './sections/about-section/about-section';
import { WorkSection } from './sections/work-section/work-section';
import { EducationSection } from './sections/education-section/education-section';
// import { ProjectSection } from './sections/project-section/project-section';

export const ResumePage = () => {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <EducationSection />
      {/* <ProjectSection /> */}
    </div>
  );
};
