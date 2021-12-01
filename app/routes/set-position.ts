import type { ActionFunction } from 'remix'
import { redirect } from 'remix'
import { positionParser } from '~/stories/parsers'
import { db } from '~/db/prisma.server'
import { z } from 'zod'

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const data = Object.fromEntries(form)
  const parsed = positionParser.safeParse(data)
  if (parsed.success === false) {
    return { success: false, errors: parsed.error.issues }
  }

  await setPosition(parsed.data)
  return redirect("/")

}
const setPosition = async (input: z.infer<typeof positionParser>) => {
  const anchor = await db.story.findFirst({
    where: { id: input.storyAnchor },
  })

  if (!anchor) {
    throw new Error(`Anchor ${input.storyAnchor} not found`)
  }

  let position = null
  if (input.relativePosition === 'after') {
    const afterAnchor = await db.story.findFirst({
      orderBy: { position: 'asc' },
      where: { position: { gt: anchor.position } },
      take: 1,
    })

    position =
      anchor.position +
      (afterAnchor?.position
        ? (afterAnchor.position - anchor.position) / 2
        : 1)
  } else {
    const beforeAnchor = await db.story.findFirst({
      orderBy: { position: 'desc' },
      where: { position: { lt: anchor.position } },
      take: 1,
    })

    position =
      anchor.position -
      (beforeAnchor?.position
        ? (anchor.position - beforeAnchor.position) / 2
        : 1)
  }
  await db.story.update({
    where: { id: input.storyId },
    data: { position },
  })
}
