import { useDashboard } from './dashboard-context'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const experiencePeriod = (
  startYear: number,
  startMonth: number | null,
  endYear: number | null,
  endMonth: number | null,
  current: boolean,
) =>
  `${startMonth ? `${months[startMonth - 1]} ` : ''}${startYear} – ${current ? 'Present' : `${endMonth ? `${months[endMonth - 1]} ` : ''}${endYear ?? ''}`}`

const Header = ({ title, description }: { title: string; description: string }) => (
  <header className="mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </header>
)

export const PreviewPage = () => {
  const { draft } = useDashboard()
  if (!draft) return <p>Loading...</p>
  return (
    <>
      <Header
        title="Draft preview"
        description="Visual preview of unpublished portfolio content."
      />
      <article className="mx-auto max-w-2xl space-y-10 rounded-xl border bg-background p-6">
        <header className="flex items-center gap-4">
          {draft.profile.avatar ? (
            <img
              className="size-20 rounded-full object-cover"
              src={`/api/dashboard/media/${draft.profile.avatar.id}`}
              alt={draft.profile.name}
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-full bg-slate-200 text-2xl font-bold dark:bg-slate-800">
              {draft.profile.name.slice(0, 1)}
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold">{draft.profile.name}</h2>
            <p>{draft.profile.headline}</p>
            <p className="text-sm text-muted-foreground">{draft.profile.pronouns}</p>
          </div>
        </header>
        <section>
          <h3 className="mb-2 text-xl font-bold">About</h3>
          <p className="text-sm leading-6">{draft.profile.about}</p>
        </section>
        {(['work', 'education'] as const).map((kind) => (
          <section key={kind}>
            <h3 className="mb-3 text-xl font-bold">
              {kind === 'work' ? 'Work Experience' : 'Education'}
            </h3>
            <div className="space-y-3">
              {draft.experiences
                .filter((experience) => experience.kind === kind)
                .map((experience) => (
                  <div key={experience.id} className="flex gap-3 rounded-lg border p-3">
                    {experience.logo && (
                      <img
                        src={`/api/dashboard/media/${experience.logo.id}`}
                        alt=""
                        className="size-11 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <strong>{experience.organization}</strong>
                      <p className="text-sm">
                        {experience.roleOrProgram} ·{' '}
                        {experiencePeriod(
                          experience.startYear,
                          experience.startMonth,
                          experience.endYear,
                          experience.endMonth,
                          experience.isCurrent,
                        )}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{experience.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
        <section>
          <h3 className="mb-3 text-xl font-bold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {draft.technologies.map((technology) => (
              <span key={technology} className="rounded-full border px-3 py-1 text-xs">
                {technology}
              </span>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 text-xl font-bold">Projects</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {draft.projects.map((project) => (
              <div key={project.id} className="overflow-hidden rounded-lg border">
                {project.image && (
                  <img
                    className="h-32 w-full object-cover"
                    src={`/api/dashboard/media/${project.image.id}`}
                    alt={project.title}
                  />
                )}
                <div className="p-3">
                  <strong>{project.title}</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-full border px-2 py-0.5 text-[11px]"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.links.map((link) => (
                      <a
                        key={`${link.platformKey}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 text-xl font-bold">Contacts</h3>
          <div className="flex flex-wrap gap-2">
            {draft.contacts
              .filter((contact) => contact.isVisible)
              .map((contact) => (
                <a
                  key={contact.id}
                  href={contact.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  {contact.icon && (
                    <img
                      src={`/api/dashboard/media/${contact.icon.id}`}
                      alt=""
                      className="size-4 object-contain"
                    />
                  )}
                  {contact.label}
                </a>
              ))}
          </div>
        </section>
      </article>
    </>
  )
}
