import * as React from 'react'
import { z } from 'zod'
import { Form } from 'remix'

import TextArea from '~/components/textarea'

import type { DomainActionResult } from '~/domain/stories'

function extractError(name: string, errors: z.ZodIssue[] | undefined) {
  return errors?.find((e) => e.path.includes(name))
}

type Props = {
  data: DomainActionResult | undefined
  editing: string | null
  setEditing: (id: string | null) => void
}
function StoryForm({ data, editing, setEditing }: Props) {
  let form = React.useRef<HTMLFormElement>(null)

  React.useEffect(() => {
    if (data?.success) form.current?.reset()
  }, [data])

  return (
    <Form
      ref={form}
      replace
      method="post"
      className="flex flex-col w-full gap-1 divide-y divide-gray-200 shadow-lg dark:divide-gray-700"
    >
      <TextArea
        name="asA"
        label="As a"
        placeholder="Some role"
        error={extractError('asA', data?.errors)}
      />
      <TextArea
        name="iWant"
        label="I want to"
        placeholder="Do something"
        error={extractError('iWant', data?.errors)}
      />
      <TextArea
        name="soThat"
        label="So that"
        placeholder="I gain some value"
        error={extractError('soThat', data?.errors)}
      />
      <button
        className="p-4 text-2xl text-center bg-blue-400 dark:bg-blue-900"
        type="submit"
      >
        {editing ? 'Save' : 'Create'}
      </button>
      {editing && (
        <button
          className="p-4 text-2xl text-center bg-blue-400 dark:bg-blue-900"
          type="button"
          onClick={() => setEditing(null)}
        >
          Cancel
        </button>
      )}
    </Form>
  )
}

export default StoryForm
