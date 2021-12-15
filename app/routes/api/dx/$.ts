import { ActionFunction, LoaderFunction } from 'remix'
import { z, ZodTypeAny } from 'zod'

type Action<I extends ZodTypeAny = ZodTypeAny, O = unknown> = {
  mutation: boolean
  parser?: I
  run: (input?: z.infer<I>) => Promise<O>
}

const domain: Record<string, Record<string, unknown>> = {
  stories: {
    all: {
      mutation: false,
      parser: z.object({
        userId: z.string().nonempty(),
        fizz: z.string().nonempty(),
      }),
      run: async () => {
        return [{ id: 1 }, { id: 2 }]
      },
    },
  },
  auth: {
    login: {
      mutation: true,
      parser: undefined,
      run: async () => ({ token: 'token' }),
    },
  },
} as const

export let loader: LoaderFunction = async ({ request, params }) => {
  const [subdomain, action] = (params['*'] ?? '').split('/')
  if (typeof subdomain !== 'string' || typeof action !== 'string')
    throw new Response('Not Found', { status: 404 })

  const fn = domain[subdomain]?.[action] as Action

  if (typeof fn?.['run'] !== 'function' || fn?.['mutation'] === true)
    throw new Response('Not Found', { status: 404 })

  if (typeof fn['parser'] === 'undefined') return fn.run()

  const url = new URL(request.url)
  const data = Object.fromEntries(url.searchParams)
  const input = fn.parser.safeParse(data)

  if (input.success === false)
    throw new Response('Invalid Parameters', { status: 422 })

  return fn.run(input.data)
}

export let action: ActionFunction = async ({ request, params }) => {
  const [subdomain, action] = (params['*'] ?? '').split('/')
  if (typeof subdomain !== 'string' || typeof action !== 'string')
    throw new Response('Not Found', { status: 404 })

  const fn = domain[subdomain]?.[action] as Action

  if (typeof fn?.['run'] !== 'function' || fn?.['mutation'] === false)
    throw new Response('Not Found', { status: 404 })

  if (typeof fn['parser'] === 'undefined') return fn.run()

  const data = Object.fromEntries(await request.formData())
  const input = fn.parser.safeParse(data)

  if (input.success === false)
    throw new Response('Invalid Parameters', { status: 422 })

  return fn.run(input.data)
}
