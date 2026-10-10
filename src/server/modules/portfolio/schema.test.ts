import { describe, expect, test } from 'bun:test'
import { parsePortfolioDraft } from './schema'

const validDraft = () => ({
  expectedVersion: 2,
  profile: {
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
      url: 'https://example.com',
      icon: null,
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
})
