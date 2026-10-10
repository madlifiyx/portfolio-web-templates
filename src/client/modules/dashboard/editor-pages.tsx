import { type ChangeEvent, useEffect, useState } from 'react'
import type { Contact, Experience, Platform, Project } from '../../../shared/types/portfolio'
import { getAssets, publish, uploadAsset } from './api'
import { useDashboard } from './dashboard-context'

const Header = ({ title, description }: { title: string; description: string }) => (
  <header className="mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </header>
)
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <fieldset className="block text-sm font-medium">
    <legend>{label}</legend>
    <span className="mt-1 block">{children}</span>
  </fieldset>
)
const inputClass = 'w-full rounded-md border bg-background px-3 py-2 font-normal'
const SaveBar = () => {
  const { save, saving, message } = useDashboard()
  return (
    <div className="mt-6 flex items-center gap-3 border-t pt-4">
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save draft'}
      </button>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

export const OverviewPage = () => {
  const { draft, loading, reload } = useDashboard()
  const [message, setMessage] = useState('')
  const [publishing, setPublishing] = useState(false)
  if (loading || !draft) return <p>Loading draft...</p>
  return (
    <>
      <Header
        title="Dashboard"
        description="Manage a private draft, preview it, then publish the complete portfolio."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <strong>{draft.projects.length}</strong>
          <p className="text-sm">Projects</p>
        </div>
        <div className="rounded-lg border p-4">
          <strong>{draft.experiences.length}</strong>
          <p className="text-sm">Experiences</p>
        </div>
        <div className="rounded-lg border p-4">
          <strong>{draft.contacts.length}</strong>
          <p className="text-sm">Contacts</p>
        </div>
      </div>
      <button
        type="button"
        disabled={publishing}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
        onClick={() => {
          if (!confirm('Publish this complete draft to the public portfolio?')) return
          setPublishing(true)
          publish()
            .then((result) => {
              setMessage(`Published version ${result.publishedVersion}`)
              reload()
            })
            .catch((error) => setMessage(error instanceof Error ? error.message : 'Publish failed'))
            .finally(() => setPublishing(false))
        }}
      >
        {publishing ? 'Publishing...' : 'Publish draft'}
      </button>
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
    </>
  )
}

export const ProfilePage = () => {
  const { draft, setDraft } = useDashboard()
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  if (!draft) return <p>Loading...</p>
  const update =
    (key: keyof typeof draft.profile) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft({ ...draft, profile: { ...draft.profile, [key]: event.target.value } })
  return (
    <>
      <Header title="Profile" description="Main identity shown on the public portfolio." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className={inputClass} value={draft.profile.name} onChange={update('name')} />
        </Field>
        <Field label="Pronouns">
          <input
            className={inputClass}
            value={draft.profile.pronouns}
            onChange={update('pronouns')}
          />
        </Field>
        <Field label="Headline">
          <input
            className={inputClass}
            value={draft.profile.headline}
            onChange={update('headline')}
          />
        </Field>
        <Field label="About">
          <textarea
            className={inputClass}
            rows={5}
            value={draft.profile.about}
            onChange={update('about')}
          />
        </Field>
        <Field label="Avatar">
          <select
            className={inputClass}
            value={draft.profile.avatar?.id ?? ''}
            onChange={(event) =>
              setDraft({
                ...draft,
                profile: {
                  ...draft.profile,
                  avatar: assets.find((asset) => asset.id === event.target.value) ?? null,
                },
              })
            }
          >
            <option value="">No avatar</option>
            {assets
              .filter((asset) => asset.contentType.startsWith('image/'))
              .map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Resume">
          <select
            className={inputClass}
            value={draft.profile.resume?.id ?? ''}
            onChange={(event) =>
              setDraft({
                ...draft,
                profile: {
                  ...draft.profile,
                  resume: assets.find((asset) => asset.id === event.target.value) ?? null,
                },
              })
            }
          >
            <option value="">No resume</option>
            {assets
              .filter((asset) => asset.contentType === 'application/pdf')
              .map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename}
                </option>
              ))}
          </select>
        </Field>
      </div>
      <SaveBar />
    </>
  )
}

const ExperienceRow = ({
  value,
  onChange,
  onDelete,
}: {
  value: Experience
  onChange: (value: Experience) => void
  onDelete: () => void
}) => (
  <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
    <Field label="Type">
      <select
        className={inputClass}
        value={value.kind}
        onChange={(event) =>
          onChange({ ...value, kind: event.target.value === 'education' ? 'education' : 'work' })
        }
      >
        <option value="work">Work</option>
        <option value="education">Education</option>
      </select>
    </Field>
    <Field label="Organization">
      <input
        className={inputClass}
        value={value.organization}
        onChange={(event) => onChange({ ...value, organization: event.target.value })}
      />
    </Field>
    <Field label="Role or program">
      <input
        className={inputClass}
        value={value.roleOrProgram}
        onChange={(event) => onChange({ ...value, roleOrProgram: event.target.value })}
      />
    </Field>
    <Field label="Website">
      <input
        className={inputClass}
        value={value.websiteUrl}
        onChange={(event) => onChange({ ...value, websiteUrl: event.target.value })}
      />
    </Field>
    <Field label="Start year">
      <input
        className={inputClass}
        type="number"
        value={value.startYear}
        onChange={(event) => onChange({ ...value, startYear: Number(event.target.value) })}
      />
    </Field>
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value.isCurrent}
        onChange={(event) => onChange({ ...value, isCurrent: event.target.checked })}
      />
      Current
    </label>
    <Field label="Description">
      <textarea
        className={inputClass}
        value={value.description}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
      />
    </Field>
    <button
      type="button"
      className="self-end justify-self-start text-sm text-red-600"
      onClick={onDelete}
    >
      Delete
    </button>
  </div>
)

export const ExperiencePage = () => {
  const { draft, setDraft } = useDashboard()
  if (!draft) return <p>Loading...</p>
  const update = (index: number, value: Experience) =>
    setDraft({
      ...draft,
      experiences: draft.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...value, sortOrder: index } : item,
      ),
    })
  return (
    <>
      <Header title="Experience" description="Work and education history." />
      <div className="space-y-3">
        {draft.experiences.map((item, index) => (
          <ExperienceRow
            key={item.id}
            value={item}
            onChange={(value) => update(index, value)}
            onDelete={() =>
              setDraft({
                ...draft,
                experiences: draft.experiences.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}
      </div>
      <button
        type="button"
        className="mt-4 rounded-md border px-3 py-2"
        onClick={() =>
          setDraft({
            ...draft,
            experiences: [
              ...draft.experiences,
              {
                id: crypto.randomUUID(),
                kind: 'work',
                organization: 'New organization',
                roleOrProgram: 'Role',
                websiteUrl: '',
                logo: null,
                startYear: new Date().getFullYear(),
                startMonth: null,
                endYear: null,
                endMonth: null,
                isCurrent: true,
                description: '',
                sortOrder: draft.experiences.length,
              },
            ],
          })
        }
      >
        Add experience
      </button>
      <SaveBar />
    </>
  )
}

export const SkillsPage = () => {
  const { draft, setDraft } = useDashboard()
  const [skill, setSkill] = useState('')
  if (!draft) return <p>Loading...</p>
  return (
    <>
      <Header title="Skills" description="Technology badges and project technology catalog." />
      <div className="flex flex-wrap gap-2">
        {draft.technologies.map((name) => (
          <button
            type="button"
            key={name}
            className="rounded-full border px-3 py-1 text-sm"
            onClick={() =>
              setDraft({
                ...draft,
                technologies: draft.technologies.filter((item) => item !== name),
              })
            }
          >
            {name} ×
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className={inputClass}
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          placeholder="Technology"
        />
        <button
          type="button"
          className="rounded-md border px-3"
          onClick={() => {
            if (skill.trim())
              setDraft({
                ...draft,
                technologies: [...new Set([...draft.technologies, skill.trim()])],
              })
            setSkill('')
          }}
        >
          Add
        </button>
      </div>
      <SaveBar />
    </>
  )
}

const simpleProject = (index: number): Project => ({
  id: crypto.randomUUID(),
  title: 'New project',
  description: 'Project description',
  projectDate: null,
  image: null,
  clientName: '',
  projectType: 'Personal',
  projectRole: 'Frontend',
  sortOrder: index,
  technologies: [],
  links: [],
})
export const ProjectsPage = () => {
  const { draft, setDraft } = useDashboard()
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  if (!draft) return <p>Loading...</p>
  return (
    <>
      <Header title="Projects" description="Projects, technologies, and platform links." />
      <div className="space-y-3">
        {draft.projects.map((project, index) => (
          <div key={project.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                className={inputClass}
                value={project.title}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: event.target.value } : item,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Role">
              <input
                className={inputClass}
                value={project.projectRole}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, projectRole: event.target.value } : item,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Type">
              <input
                className={inputClass}
                value={project.projectType}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, projectType: event.target.value } : item,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Client or company">
              <input
                className={inputClass}
                value={project.clientName}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, clientName: event.target.value } : item,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className={inputClass}
                value={project.projectDate ?? ''}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, projectDate: event.target.value || null }
                        : item,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Image">
              <select
                className={inputClass}
                value={project.image?.id ?? ''}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            image: assets.find((asset) => asset.id === event.target.value) ?? null,
                          }
                        : item,
                    ),
                  })
                }
              >
                <option value="">No image</option>
                {assets
                  .filter((asset) => asset.contentType.startsWith('image/'))
                  .map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.filename}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Technologies (comma separated)">
              <input
                className={inputClass}
                value={project.technologies.join(', ')}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            technologies: event.target.value
                              .split(',')
                              .map((value) => value.trim())
                              .filter(Boolean),
                          }
                        : item,
                    ),
                  })
                }
              />
            </Field>
            <fieldset className="space-y-2 sm:col-span-2">
              <legend className="text-sm font-medium">Project links</legend>
              {project.links.map((link, linkIndex) => (
                <div
                  key={`${link.platformKey}-${link.url}`}
                  className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
                >
                  <select
                    className={inputClass}
                    value={link.platformKey}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                links: item.links.map((current, currentIndex) =>
                                  currentIndex === linkIndex
                                    ? {
                                        ...current,
                                        platformKey: event.target.value,
                                        label:
                                          draft.platforms.find(
                                            (platform) => platform.key === event.target.value,
                                          )?.name ?? current.label,
                                      }
                                    : current,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    {draft.platforms.map((platform) => (
                      <option key={platform.id} value={platform.key}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    value={link.url}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                links: item.links.map((current, currentIndex) =>
                                  currentIndex === linkIndex
                                    ? { ...current, url: event.target.value }
                                    : current,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                links: item.links
                                  .filter((_, currentIndex) => currentIndex !== linkIndex)
                                  .map((current, sortOrder) => ({ ...current, sortOrder })),
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm"
                onClick={() => {
                  const platform = draft.platforms[0]
                  if (!platform) return
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            links: [
                              ...item.links,
                              {
                                platformKey: platform.key,
                                label: platform.name,
                                url: 'https://example.com',
                                sortOrder: item.links.length,
                              },
                            ],
                          }
                        : item,
                    ),
                  })
                }}
              >
                Add link
              </button>
            </fieldset>
            <Field label="Description">
              <textarea
                className={inputClass}
                value={project.description}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    projects: draft.projects.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, description: event.target.value } : item,
                    ),
                  })
                }
              />
            </Field>
            <button
              type="button"
              className="self-end justify-self-start text-sm text-red-600"
              onClick={() =>
                setDraft({
                  ...draft,
                  projects: draft.projects.filter((_, itemIndex) => itemIndex !== index),
                })
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 rounded-md border px-3 py-2"
        onClick={() =>
          setDraft({
            ...draft,
            projects: [...draft.projects, simpleProject(draft.projects.length)],
          })
        }
      >
        Add project
      </button>
      <SaveBar />
    </>
  )
}

const simpleContact = (index: number): Contact => ({
  id: crypto.randomUUID(),
  platformKey: 'website',
  label: 'Website',
  url: 'https://example.com',
  icon: null,
  sortOrder: index,
  isVisible: true,
})
export const ContactsPage = () => {
  const { draft, setDraft } = useDashboard()
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  if (!draft) return <p>Loading...</p>
  return (
    <>
      <Header
        title="Contacts"
        description="Choose a platform, override its label, and set a safe URL."
      />
      {draft.contacts.map((contact, index) => (
        <div key={contact.id} className="mb-3 grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
          <Field label="Platform">
            <select
              className={inputClass}
              value={contact.platformKey}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contacts: draft.contacts.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, platformKey: event.target.value } : item,
                  ),
                })
              }
            >
              {draft.platforms.map((platform) => (
                <option key={platform.key} value={platform.key}>
                  {platform.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Label">
            <input
              className={inputClass}
              value={contact.label}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contacts: draft.contacts.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, label: event.target.value } : item,
                  ),
                })
              }
            />
          </Field>
          <Field label="URL">
            <input
              className={inputClass}
              value={contact.url}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contacts: draft.contacts.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, url: event.target.value } : item,
                  ),
                })
              }
            />
          </Field>
          <Field label="Icon override">
            <select
              className={inputClass}
              value={contact.icon?.id ?? ''}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contacts: draft.contacts.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          icon: assets.find((asset) => asset.id === event.target.value) ?? null,
                        }
                      : item,
                  ),
                })
              }
            >
              <option value="">Use platform default</option>
              {assets
                .filter((asset) => ['image/png', 'image/webp'].includes(asset.contentType))
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.filename}
                  </option>
                ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={contact.isVisible}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contacts: draft.contacts.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, isVisible: event.target.checked } : item,
                  ),
                })
              }
            />
            Visible
          </label>
          <button
            type="button"
            className="text-left text-sm text-red-600"
            onClick={() =>
              setDraft({
                ...draft,
                contacts: draft.contacts.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          >
            Delete
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border px-3 py-2"
        onClick={() =>
          setDraft({
            ...draft,
            contacts: [...draft.contacts, simpleContact(draft.contacts.length)],
          })
        }
      >
        Add contact
      </button>
      <SaveBar />
    </>
  )
}

const simplePlatform = (index: number): Platform => ({
  id: crypto.randomUUID(),
  key: `custom-${index + 1}`,
  name: 'Custom',
  defaultIcon: null,
  sortOrder: index,
  isActive: true,
})
export const PlatformsPage = () => {
  const { draft, setDraft } = useDashboard()
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  if (!draft) return <p>Loading...</p>
  return (
    <>
      <Header
        title="Platforms"
        description="Reusable labels and default icons for contacts and project links."
      />
      {draft.platforms.map((platform, index) => (
        <div key={platform.id} className="mb-3 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
          <Field label="Key">
            <input
              className={inputClass}
              value={platform.key}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  platforms: draft.platforms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, key: event.target.value } : item,
                  ),
                  contacts: draft.contacts.map((contact) =>
                    contact.platformKey === platform.key
                      ? { ...contact, platformKey: event.target.value }
                      : contact,
                  ),
                  projects: draft.projects.map((project) => ({
                    ...project,
                    links: project.links.map((link) =>
                      link.platformKey === platform.key
                        ? { ...link, platformKey: event.target.value }
                        : link,
                    ),
                  })),
                })
              }
            />
          </Field>
          <Field label="Name">
            <input
              className={inputClass}
              value={platform.name}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  platforms: draft.platforms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, name: event.target.value } : item,
                  ),
                })
              }
            />
          </Field>
          <Field label="Default icon">
            <select
              className={inputClass}
              value={platform.defaultIcon?.id ?? ''}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  platforms: draft.platforms.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          defaultIcon:
                            assets.find((asset) => asset.id === event.target.value) ?? null,
                        }
                      : item,
                  ),
                })
              }
            >
              <option value="">No default icon</option>
              {assets
                .filter((asset) => ['image/png', 'image/webp'].includes(asset.contentType))
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.filename}
                  </option>
                ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={platform.isActive}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  platforms: draft.platforms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, isActive: event.target.checked } : item,
                  ),
                })
              }
            />
            Active
          </label>
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border px-3 py-2"
        onClick={() =>
          setDraft({
            ...draft,
            platforms: [...draft.platforms, simplePlatform(draft.platforms.length)],
          })
        }
      >
        Add platform
      </button>
      <SaveBar />
    </>
  )
}

export const MediaPage = () => {
  const [message, setMessage] = useState('')
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const file = form.get('file')
    if (!(file instanceof File)) return
    try {
      const asset = await uploadAsset(file, String(form.get('category') ?? 'uploads'))
      setAssets((current) => [asset, ...current])
      setMessage(`Uploaded ${asset.filename}: ${asset.url}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }
  return (
    <>
      <Header title="Media" description="Upload immutable PNG, JPEG, WebP, or PDF assets." />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Category">
          <select name="category" className={inputClass}>
            <option value="profile-avatar">Profile avatar</option>
            <option value="profile-resume">Resume</option>
            <option value="projects">Project</option>
            <option value="contacts">Contact icon</option>
          </select>
        </Field>
        <Field label="File">
          <input
            name="file"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className={inputClass}
          />
        </Field>
        <button
          className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-lg border p-3 text-sm">
            <a
              href={`/api/dashboard/media/${asset.id}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline"
            >
              {asset.filename}
            </a>
            <p className="text-muted-foreground">{asset.contentType}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

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
        <section>
          <h3 className="mb-3 text-xl font-bold">Experience</h3>
          <div className="space-y-3">
            {draft.experiences.map((experience) => (
              <div key={experience.id} className="rounded-lg border p-3">
                <strong>{experience.organization}</strong>
                <p className="text-sm">{experience.roleOrProgram}</p>
                <p className="mt-2 text-sm text-muted-foreground">{experience.description}</p>
              </div>
            ))}
          </div>
        </section>
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
                <span key={contact.id} className="rounded-md border px-3 py-2 text-sm">
                  {contact.label}
                </span>
              ))}
          </div>
        </section>
      </article>
    </>
  )
}
