import { describe, expect, test } from 'bun:test'
import {
  parseContactDraft,
  parseDraftReorder,
  parseExperienceDraft,
  parsePortfolioDraft,
} from './schema'

const validDraft = () => ({
  expectedVersion: 2,
  profile: {
    id: crypto.randomUUID(),
    name: 'Owner',
    pronouns: '',
    headline: 'Engineer',
    about: 'About',
    avatar: null,
    resume: null,
  },
  experiences: [],
  technologies: ['Bun'],
  projects: [],
  platforms: [
    { id: crypto.randomUUID(), key: 'website', name: 'Website', defaultIcon: null, isActive: true },
  ],
  contacts: [
    {
      id: crypto.randomUUID(),
      platformKey: 'website',
      label: 'Site',
      labelOverride: 'Site',
      url: 'https://example.com',
      icon: null,
      iconOverride: null,
      isVisible: true,
    },
  ],
})

describe('parsePortfolioDraft', () => {
  test('accepts a valid draft', () => {
    expect(parsePortfolioDraft(validDraft()).profile.name).toBe('Owner')
  })

  test('rejects duplicate normalized technologies', () => {
    const draft = validDraft()
    draft.technologies = ['Tailwind CSS', 'tailwind   css']
    expect(() => parsePortfolioDraft(draft)).toThrow('Technology names must be unique')
  })

  test('rejects unknown contact platforms', () => {
    const draft = validDraft()
    draft.contacts[0].platformKey = 'missing'
    expect(() => parsePortfolioDraft(draft)).toThrow('Unknown contact platform')
  })

  test('rejects unsafe contact URLs', () => {
    const draft = validDraft()
    draft.contacts[0].url = 'javascript:alert(1)'
    expect(() => parsePortfolioDraft(draft)).toThrow('URL must use https, mailto, or tel')
  })

  test('rejects same-year experience with end month before start month', () => {
    expect(() =>
      parseExperienceDraft({
        expectedVersion: 2,
        kind: 'work',
        organization: 'Company',
        roleOrProgram: 'Engineer',
        websiteUrl: '',
        logo: null,
        startYear: 2026,
        startMonth: 10,
        endYear: 2026,
        endMonth: 9,
        isCurrent: false,
        description: '',
      }),
    ).toThrow('Experience period is invalid')
  })

  test('preserves null contact overrides separately from resolved values', () => {
    expect(
      parseContactDraft({
        expectedVersion: 2,
        platformKey: 'website',
        labelOverride: null,
        label: 'Website',
        url: 'https://example.com',
        iconOverride: null,
        icon: { id: crypto.randomUUID(), filename: 'default.png', contentType: 'image/png' },
        isVisible: true,
      }),
    ).toMatchObject({ labelOverride: null, iconOverride: null })
  })

  test('rejects duplicate reorder IDs', () => {
    const id = crypto.randomUUID()
    expect(() => parseDraftReorder({ expectedVersion: 2, ids: [id, id] })).toThrow(
      'Entity IDs must be unique',
    )
  })
})
