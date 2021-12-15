import { db } from '~/db/prisma.server'
import head from 'lodash/head'
import type { Story } from './types'

async function getStories(id: string | null = null): Promise<Story[]> {
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
      WHERE coalesce(s.id = ${id}, true)
      ORDER BY position ASC`
}

const getStory = async (id: string) => head(await getStories(id))

export { getStories, getStory }
