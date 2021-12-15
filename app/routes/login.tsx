import {
  ActionFunction,
  createCookieSessionStorage,
  Form,
  redirect,
  useActionData,
} from 'remix'
import bcrypt from 'bcrypt'
import { json, useSearchParams } from 'remix'
import { db } from '~/db/prisma.server'
import { logout } from './logout'

export async function requireUser(request: Request) {
  const userId = await getUserId(request)
  if (typeof userId !== 'string') {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch {
    throw logout(request)
  }
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

const sessionSecret = process.env.SESSION_SECRET ?? 'S3cr3t'
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'RJ_session',
    secure: true,
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

async function register({ email, password }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10)
  return db.user.create({
    data: { email, passwordHash },
  })
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

type LoginForm = {
  email: string
  password: string
}

async function login({ email, password }: LoginForm) {
  const user = await db.user.findUnique({
    where: { email },
  })
  if (!user) return null

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isCorrectPassword) return null

  return user
}

function validateEmail(email: unknown) {
  if (typeof email !== 'string' || email.length < 3) {
    return `Emails must be at least 3 characters long`
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`
  }
}

type ActionData = {
  formError?: string
  fieldErrors?: {
    email: string | undefined
    password: string | undefined
  }
  fields?: {
    loginType: string
    email: string
    password: string
  }
}

const badRequest = (data: ActionData) => json(data, { status: 400 })

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const loginType = form.get('loginType')
  const email = form.get('email')
  const password = form.get('password')
  const redirectTo = form.get('redirectTo') || '/stories'
  if (
    typeof loginType !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    })
  }

  const fields = { loginType, email, password }
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  }
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields })

  switch (loginType) {
    case 'login': {
      const user = await login({ email, password })
      if (!user) {
        return {
          fields,
          formError: `Username/Password combination is incorrect`,
        }
      }
      return createUserSession(user.id, redirectTo)
    }
    case 'register': {
      const userExists = await db.user.findFirst({
        where: { email },
      })
      if (userExists) {
        return badRequest({
          fields,
          formError: `User with email ${email} already exists`,
        })
      }
      const user = await register({ email, password })
      if (!user) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user.`,
        })
      }
    }
    default: {
      return badRequest({
        fields,
        formError: `Login type invalid`,
      })
    }
  }
}

export default function Login() {
  const data = useActionData()

  console.log({ data })
  const [searchParams] = useSearchParams()
  return (
    <div className="grow">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{' '}
              Login
            </label>
            <label>
              <input type="radio" name="loginType" value="register" /> Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="email-input">Email</label>
            <input type="text" id="email-input" name="email" />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input id="password-input" name="password" type="password" />
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
    </div>
  )
}
