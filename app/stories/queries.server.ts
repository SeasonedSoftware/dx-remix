import { db } from '~/db/prisma.server'

async function getStories() {
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

export { getStories }
