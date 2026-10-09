import { AboutSection } from './resume-sections/about-section'
import { ContactSection } from './resume-sections/contact-section'
import { EducationSection } from './resume-sections/education-section'
import { HeroSection } from './resume-sections/hero-section'
import { ProjectSection } from './resume-sections/project-section'
import { SkillSection } from './resume-sections/skill-section'
import { WorkSection } from './resume-sections/work-section'

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
  )
}
