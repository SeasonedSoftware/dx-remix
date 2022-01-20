import { createParser } from '~/domain/stories/parsers'
import { DataFunctionArgs } from '@remix-run/server-runtime'
import { db } from '~/db/prisma.server'
import * as z from 'zod'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'


const baseStories = {
  getStories:
  {
    mutation: false,
    run: async () => {
      return db.$queryRaw`
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
    }
  },
  createStory: {
    mutation: true,
    run: async (data: z.infer<typeof createParser>) => {
      await db.story.create({ data })
      return { success: true }
    }
  }
}

type ExportedActions = Record<string, LoaderFunction | ActionFunction>
const loader: LoaderFunction = baseStories.getStories.run
const action: ActionFunction = async ({ request }: DataFunctionArgs) => {
  const form = await request.formData()
  const data = Object.fromEntries(form)
  const parsed = createParser.safeParse(data)
  if (parsed.success === false) {
    return { success: false, errors: parsed.error.issues }
  }

  return baseStories.createStory.run(parsed.data)
}

const stories: ExportedActions = {
  getStories: loader,
  createStory: action,
}

export { stories }
