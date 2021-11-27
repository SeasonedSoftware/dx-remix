import type { Story as DbStory } from '@prisma/client'
import { STORY_STATES } from './constants'

type Story = Omit<DbStory, 'position'> & { state: typeof STORY_STATES[number] }

export type { Story }
