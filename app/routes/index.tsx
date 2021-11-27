import * as React from 'react'
import { z } from 'zod'
import { useLoaderData, useActionData } from 'remix'
import { groupBy } from 'lodash'
import { createParser, storyParser } from '~/stories/parsers'
import { db } from '~/db/prisma.server'
import { getStories } from '~/stories/queries.server'

import StoriesList from '~/components/stories-list'
import StoryForm from '~/components/story-form'

import type { Story } from '~/stories/types'
import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'

export let meta: MetaFunction = () => {
  return {
    title: 'KODO',
    description: 'A project management solution inspired by the Shape Up',
  }
}

export let loader: LoaderFunction = async () => {
  return getStories()
}

type ActionData = { success: boolean; errors?: z.ZodIssue[] | undefined }
export let action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const form = await request.formData()
  const data = Object.fromEntries(form)
  const parsed = createParser.safeParse(data)
  if (parsed.success === false) {
    return { success: false, errors: parsed.error.issues }
  }

  await db.story.create({ data: parsed.data })
  return { success: true }
}

export default function Index() {
  let data = z.array(storyParser).parse(useLoaderData())
  let actionData = useActionData<ActionData>()
  let [editing, setEditing] = React.useState<string | null>(null)

  let storyGroups = groupBy(data, 'state') as unknown as Record<
    Story['state'],
    Story[]
  >

  return (
    <main className="flex flex-col items-center justify-center flex-grow w-full gap-8 pt-6 md:flex-row md:items-start">
      <section className="flex flex-col items-center justify-center w-full bg-white md:w-96 dark:bg-gray-800">
        <StoryForm
          editing={editing}
          setEditing={setEditing}
          data={actionData}
        />
      </section>
      <div className="flex flex-col w-full gap-4 md:w-96">
        <StoriesList
          items={storyGroups.ready ?? []}
          title="Ready for development"
          setEditing={setEditing}
        />
        <StoriesList
          items={(storyGroups.draft ?? []).concat(
            storyGroups.draft_with_scenarios ?? []
          )}
          title="Draft"
          setEditing={setEditing}
        />
      </div>
      <div className="flex flex-col w-full gap-4 md:w-96">
        <StoriesList
          items={storyGroups.development ?? []}
          title="In development"
          setEditing={setEditing}
        />
        <StoriesList
          items={storyGroups.approved ?? []}
          title="Done"
          setEditing={setEditing}
        />
      </div>
    </main>
  )
}

export type { ActionData }
