import { z } from 'zod'
import { STORY_STATES } from './constants'

const storyParser = z.object({
  id: z.string(),
  asA: z.string().nonempty(),
  iWant: z.string().nonempty(),
  soThat: z.string().nonempty(),
  state: z.enum(STORY_STATES),
  createdAt: z.string(),
})

const createParser = z.object({
  asA: z.string().nonempty(),
  iWant: z.string().nonempty(),
  soThat: z.string().nonempty(),
})

const updateParser = z.object({
  id: z.string(),
  asA: z.string().nonempty(),
  iWant: z.string().nonempty(),
  soThat: z.string().nonempty(),
})

const positionParser = z.object({
  storyId: z.string().nonempty(),
  storyAnchor: z.string().nonempty(),
  relativePosition: z.enum(['after', 'before']),
})

const addScenarioParser = z.object({
  storyId: z.string().nonempty(),
  description: z.string().nonempty(),
})

const storyScenarioParser = z.object({ id: z.string().nonempty() })

const justAnIdParser = z.object({
  id: z.string().nonempty(),
})

export {
  createParser,
  updateParser,
  positionParser,
  addScenarioParser,
  storyScenarioParser,
  justAnIdParser,
  storyParser,
}
