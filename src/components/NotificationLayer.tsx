import React from "react"

import { Toast } from "azure-devops-ui/Toast"

import { notificationObserver } from "../api/notificationObserver"

export function NotificationLayer() {
  const [notifications, setNotifications] = React.useState<
    {
      id: number
      message: string
      timer: NodeJS.Timeout
      ref: React.RefObject<Toast>
    }[]
  >([])

  React.useEffect(() => {
    let id = 0

    const fn = (text: string) => {
      let currentId = id + 1
      id = currentId

      const ref = React.createRef<Toast>()

      setNotifications(prev => [
        ...prev,
        {
          id: currentId,
          message: text,
          ref,
          timer: setTimeout(() => {
            if (ref.current) {
              ref.current
                .fadeOut()
                .promise.finally(() =>
                  setNotifications(prev =>
                    prev.filter(item => item.id !== currentId)
                  )
                )
            }
          }, 3000),
        },
      ])
    }
    notificationObserver.subscribe(fn)
    return () => {
      notificationObserver.unsubscribe(fn)
    }
  }, [])

  return (
    <>
      {notifications.map(item => (
        <Toast key={item.id} ref={item.ref} message={item.message} />
      ))}
    </>
  )
}
