import StoryItem from '~/components/story-item'

import type { Story } from '~/stories/types'

type Props = {
  items: Story[]
  title: string
  setEditing: (a: string | null) => void
}
export default function StoriesList({ items, title, setEditing }: Props) {
  return (
    <div className="flex flex-col">
      {title && <h3 className="block mb-2 text-xl">{title}</h3>}
      <div className="flex flex-col flex-grow w-full border border-gray-800 divide-y divide-gray-800 dark:border-gray-700 border-opacity-20 dark:divide-gray-700 divide-opacity-20">
        {items.length ? (
          items.map((story, idx: number) => (
            <StoryItem
              key={story.id}
              story={story}
              setEditing={setEditing}
              anchorBefore={items[idx - 1]?.id}
              anchorAfter={items[idx + 1]?.id}
            />
          ))
        ) : (
          <div className="p-4 text-center">There are no items to show</div>
        )}
      </div>
    </div>
  )
}
