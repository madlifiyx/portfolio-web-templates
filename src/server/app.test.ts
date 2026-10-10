import { describe, expect, test } from 'bun:test'

import { DASHBOARD_CLIENT_ROUTES, PUBLIC_CLIENT_ROUTES } from './app'

describe('public client routes', () => {
  test('keeps Bun routes aligned with React Router URLs', () => {
    expect(PUBLIC_CLIENT_ROUTES).toEqual(['/', '/contact', '/project'])
    expect(DASHBOARD_CLIENT_ROUTES).toContain('/dashboard/preview')
  })
})
