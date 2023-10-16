import React from "react"

import { getComments } from "../../../domains/comments"

function formatter(text: string) {
  return text.replaceAll(/<[^>]*>/g, "").trim()
}

function filterComment(text: string) {
  return text.startsWith("[")
}

type CommentsProps = {
  projectId: string
  workItemId: number
}
export function Comments({ projectId, workItemId }: CommentsProps) {
  const [text, setText] = React.useState<string[] | null>(null)
  React.useEffect(() => {
    getComments(projectId, workItemId)
      .then(({ comments }) => {
        setText(
          comments.map(comment => formatter(comment.text)).filter(filterComment)
        )
      })
      .catch(() => setText(["-"]))
  }, [projectId, workItemId])

  return (
    <>
      {text === null ? (
        <div>Загрузка...</div>
      ) : (
        text.map(comment => <div key={comment}>{comment}</div>)
      )}
    </>
  )
}
