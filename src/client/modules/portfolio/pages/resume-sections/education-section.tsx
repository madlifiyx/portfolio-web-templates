import { useEffect, useState } from 'react'
import { ExperienceCard } from '@/components/experience-card'
import { BlurFade } from '@/components/ui/blur-fade'
import { type ExperienceDataProps, getEducationExperience } from '@/data/data-experience'

export const EducationSection = () => {
  const [data, setData] = useState<ExperienceDataProps[] | null>(null)

  useEffect(() => {
    getEducationExperience().then(setData)
  }, [])

  return (
    <section id="education" className="mb-8">
      <BlurFade delay={0.5} inView>
        <h2 className="text-xl font-bold mb-2">Education</h2>
        {data?.map((experience) => (
          <ExperienceCard
            key={`${experience.place}-${experience.position}-${experience.startDate}`}
            {...experience}
          />
        ))}
      </BlurFade>
    </section>
  )
}
