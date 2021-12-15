import * as React from 'react'
import { LoaderFunction, useLoaderData, useNavigate } from 'remix'
import { db } from '~/db/prisma.server'
import { getStory } from '~/stories/queries.server'

import type { Story } from '~/stories/types'

export let loader: LoaderFunction = async ({ request, params }) => {
  let story = await getStory(params.id!)
  return { story }
}

export default function StoryRoute() {
  let data = useLoaderData()
  let navigate = useNavigate()
  let { story } = data
  return (
    <div className="z-20 bg-gray-900 border rounded shadow-xl border-gray-50/30 shadow-gray-800/50">
      <div
        // onDoubleClick={() => setEditing(story.id)}
        className="p-4 py-3 mt-2 mb-4"
      >
        <p>
          As a <strong>{story.asA}</strong> I want to{' '}
          <strong>{story.iWant}</strong> So that <strong>{story.soThat}</strong>
          .
        </p>
        <p className="mt-2 text-xs font-semibold text-right text-gray-900 text-opacity-60 dark:text-white dark:text-opacity-50">
          {new Date(story.createdAt).toLocaleDateString()}
        </p>
      </div>
      {story.state === 'draft' && (
        <div className="flex flex-col p-4">
          <button
            onClick={async () => {}}
            className="p-2 transition-all bg-green-500 rounded hover:bg-green-600"
          >
            mark as ready to start
          </button>
        </div>
      )}
      {story.state === 'ready' && (
        <div className="flex flex-col p-4">
          <button
            onClick={async () => {}}
            className="p-2 transition-all bg-green-500 rounded hover:bg-green-600"
          >
            start development
          </button>
        </div>
      )}
    </div>
  )
}
