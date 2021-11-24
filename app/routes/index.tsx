import * as React from 'react'
import { PrismaClient, Story as DbStory } from '@prisma/client'
import type { MetaFunction, LoaderFunction } from 'remix'
import { useLoaderData, json } from 'remix'
import groupBy from 'lodash/groupBy'
import StoriesList from '~/components/stories-list'

type StoryState =
  | 'draft'
  | 'draft_with_scenarios'
  | 'ready'
  | 'approved'
  | 'development'
type Story = Omit<DbStory, 'position'> & { state: StoryState }

export let loader: LoaderFunction = async () => {
  const prisma = new PrismaClient()
  const stories: Story[] = await prisma.$queryRaw`
    SELECT
      s.id,
      as_a as "asA",
      i_want as "iWant",
      so_that as "soThat",
      created_at as "createdAt",
      CASE
        WHEN NOT EXISTS(SELECT FROM scenario sc
                      WHERE sc.story_id = s.id) THEN 'draft'
        WHEN (
          SELECT coalesce(bool_and(sa.id IS NOT NULL), false)
          FROM scenario sc
          LEFT JOIN scenario_approval sa ON sa.scenario_id = sc.id
          WHERE sc.story_id = s.id
        ) THEN 'approved'
        WHEN EXISTS (SELECT FROM story_development sd WHERE sd.story_id = s.id) THEN 'development'
        WHEN EXISTS (SELECT FROM story_ready sr WHERE sr.story_id = s.id) THEN 'ready'
        ELSE 'draft_with_scenarios'
      END as state
    FROM story s
    ORDER BY position ASC`
  return json(stories)
}

export let meta: MetaFunction = () => {
  return {
    title: 'Remix Starter',
    description: 'Welcome to remix!',
  }
}

export default function Index() {
  let data: Story[] = useLoaderData()
  let [editing, setEditing] = React.useState<string | null>(null)

  let storyGroups = groupBy(data, 'state') as unknown as Record<
    StoryState,
    Story[]
  >

  return (
    <>
      <section className="flex flex-col items-center justify-center w-full bg-white md:w-96 dark:bg-gray-800">
        {/* <StoryForm setEditing={setEditing} list={data} editing={editing} /> */}
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
    </>
  )
}

export type { Story }
