import React from "react"

import { TeamSettingsIteration } from "azure-devops-extension-api/Work"
import endOfDay from "date-fns/endOfDay"

import { useIterations } from "../../../hooks/useIterations"
import startOfDay from "date-fns/startOfDay"
import format from "date-fns/format"

type SelectIterationProps = {
  projectId: string
  onSelect: (iteration: TeamSettingsIteration) => void
}
export function SelectIteration({ projectId, onSelect }: SelectIterationProps) {
  const { iterations } = useIterations({ projectId })

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedIteration = iterations.find(
        item => item.id === e.target.value
      )
      if (selectedIteration) onSelect(selectedIteration)
    },
    [iterations]
  )

  const iterationsSorted = React.useMemo(() => {
    const now = Date.now()

    const items = iterations.map(item => {
      const startDateObj = startOfDay(new Date(item.attributes.startDate))
      const finishDateObj = endOfDay(new Date(item.attributes.finishDate))

      return {
        ...item,
        startDate: format(startDateObj, "dd.MM"),
        finishDate: format(finishDateObj, "dd.MM.yyyy"),
        currentSprint:
          Number(now) <= Number(finishDateObj) &&
          Number(now) >= Number(startDateObj),
      }
    })
    return items.reverse()
  }, [iterations])

  return (
    <select onChange={onChange}>
      <option value={undefined}>--</option>
      {iterationsSorted.map(item => (
        <option
          key={item.id}
          value={item.id}
          style={{ backgroundColor: item.currentSprint ? "#8ac4ff" : "" }}
        >
          {item.name} [{item.startDate} - {item.finishDate}]
        </option>
      ))}
    </select>
  )
}
