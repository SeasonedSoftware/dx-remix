import { createParser } from '~/domain/stories/parsers'
import { db } from '~/db/prisma.server'
import * as z from 'zod'
import type { Story } from '~/domain/stories/types'

import type { LoaderFunction, ActionFunction } from 'remix'
import _ from 'lodash'

type DomainAction<I extends z.ZodTypeAny = z.ZodTypeAny, O = unknown> = {
  mutation: boolean
  parser?: I
  run: (input: z.infer<I>) => Promise<O>
}

type DomainActions = Record<string, DomainAction>

const query =
  <O, P extends z.ZodTypeAny | undefined = undefined>(parser?: P) =>
    (run: (input: P extends z.ZodTypeAny ? z.infer<P> : void) => Promise<O>) => ({
      mutation: false,
      parser,
      run,
    })

const mutation =
  <O, P extends z.ZodTypeAny | undefined = undefined>(parser?: P) =>
    (run: (input: P extends z.ZodTypeAny ? z.infer<P> : void) => Promise<O>) => ({
      mutation: true,
      parser,
      run,
    })


type ExportedAction = LoaderFunction | ActionFunction
type ExportedActions = Record<string, ExportedAction>

const exportAction = (action: DomainAction): ExportedAction => {
  if (action.mutation) {
    return async ({ request }) => {
      const form = await request.formData()
      const data = Object.fromEntries(form)
      const parsed = action?.parser?.safeParse(data)
      if (parsed?.success === false) {
        return { success: false, errors: parsed.error.issues }
      }

      return action.run(parsed?.data)
    }
  }
  else {
    return (args) => action.run(args)
  }
}

const exportDomain = (domain: DomainActions): ExportedActions => _.mapValues(domain, exportAction)

type DomainActionResult = { success: boolean; errors?: z.ZodIssue[] | undefined }

const actions: DomainActions = {
  getStories: query<Story[]>()(
    async () => {
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
  ),
  createStory: mutation<DomainActionResult, typeof createParser>(createParser)(
    async (data) => {
      await db.story.create({ data })
      return { success: true }
    }
  ),
}

const stories = exportDomain(actions)
export { stories }
export type { DomainActionResult, Story }
