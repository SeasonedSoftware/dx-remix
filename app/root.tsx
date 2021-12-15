import * as React from 'react'
import { Form, Links, LiveReload, LoaderFunction, Meta, Outlet } from 'remix'
import { Scripts, ScrollRestoration } from 'remix'
import { useCatch, useLocation } from 'remix'
import type { LinksFunction } from 'remix'

import globalStylesUrl from '~/styles/global.css'

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: globalStylesUrl }]
}

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url)
  if (url.pathname === '/') {
    return new Response('Redirected', {
      status: 301,
      headers: { location: '/stories' },
    })
  }
  return null
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  )
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <RouteChangeAnnouncement />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 dark:text-white">
      <header className="w-full pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-thin text-center text-red-800 dark:text-green-600">
          Stories
        </h1>
        <Form action="/logout">
          <button type="submit">Logout</button>
        </Form>
      </header>
      {children}
      <footer className="mt-12 text-xs leading-loose text-center text-gray-400">
        <p>
          Created with{' '}
          <a
            className="text-gray-900 dark:text-gray-100"
            href="http://seasoned.cc"
          >
            Seasoned DX Framework
          </a>
        </p>
      </footer>
    </div>
  )
}

export function CatchBoundary() {
  let caught = useCatch()

  let message
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      )
      break
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      )
      break

    default:
      throw new Error(caught.data || caught.statusText)
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
      </Layout>
    </Document>
  )
}

const RouteChangeAnnouncement = React.memo(() => {
  let [hydrated, setHydrated] = React.useState(false)
  let [innerHtml, setInnerHtml] = React.useState('')
  let location = useLocation()

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  let firstRenderRef = React.useRef(true)
  React.useEffect(() => {
    // Skip the first render because we don't want an announcement on the
    // initial page load.
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    let pageTitle = location.pathname === '/' ? 'Home page' : document.title
    setInnerHtml(`Navigated to ${pageTitle}`)
  }, [location.pathname])

  // Render nothing on the server. The live region provides no value unless
  // scripts are loaded and the browser takes over normal routing.
  if (!hydrated) {
    return null
  }

  return (
    <div
      aria-live="assertive"
      aria-atomic
      id="route-change-region"
      style={{
        border: '0',
        clipPath: 'inset(100%)',
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: '0',
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
      }}
    >
      {innerHtml}
    </div>
  )
})
