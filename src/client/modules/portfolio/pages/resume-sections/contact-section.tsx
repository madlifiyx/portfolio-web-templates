import { Link } from 'react-router'
import { SectionTitle, type SectionTitleProps } from '@/components/section-title'
import { BlurFade } from '@/components/ui/blur-fade'

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Contact',
  shortDescription: 'Connect with Me',
  description: (
    <p>
      I am always open to discussing new projects, opportunities, or just chatting about tech. You
      can reach me via{' '}
      <Link to="/contact" className="text-blue-400 hover:underline">
        email
      </Link>{' '}
      or{' '}
      <Link to="/contact" className="text-blue-400 hover:underline">
        phone
      </Link>
    </p>
  ),
}

export const ContactSection = () => {
  return (
    <section id="contact" className="my-12">
      <BlurFade delay={0.3} inView>
        <SectionTitle {...defaultSectionTitleProps} />
      </BlurFade>
    </section>
  )
}
