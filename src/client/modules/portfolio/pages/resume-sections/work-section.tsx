import { useEffect, useState } from 'react'
import { ExperienceCard } from '@/components/experience-card'
import { BlurFade } from '@/components/ui/blur-fade'
import { type ExperienceDataProps, getWorkExperience } from '@/data/data-experience'

export const WorkSection = () => {
  const [data, setData] = useState<ExperienceDataProps[] | null>(null)

  useEffect(() => {
    getWorkExperience().then(setData)
  }, [])

  return (
    <section id="work-experience" className="mb-8">
      <BlurFade delay={0.5} inView>
        <h2 className="text-xl font-bold mb-2">Work Experience</h2>
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
