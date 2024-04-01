import React from "react"

import { getComments } from "../../../domains/comments"
import { useOrganization } from "../../../hooks/useOrganization"
import "./Comments.css"

function formatter(text: string) {
  return text
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .trim()
}

function filterComment(text: string) {
  return text.search(/\[[A-Za-z]*\]/i) !== -1
}

type CommentsProps = {
  projectId: string
  workItemId: number
}
export function Comments({ projectId, workItemId }: CommentsProps) {
  const { organization } = useOrganization()

  const [text, setText] = React.useState<string[] | null>(null)
  React.useEffect(() => {
    getComments(organization, projectId, workItemId)
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
        text.map(comment => (
          <div key={comment} className="comment">
            {comment}
          </div>
        ))
      )}
    </>
  )
}
