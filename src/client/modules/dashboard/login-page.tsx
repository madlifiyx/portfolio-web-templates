import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { login } from './api'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError('')
    try {
      await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''))
      navigate('/dashboard')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-50">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Private CMS</p>
          <h1 className="mt-2 text-2xl font-bold">Portfolio login</h1>
        </div>
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={12}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
        >
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
