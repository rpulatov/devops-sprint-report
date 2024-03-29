import React from "react"

import { WebApiTeam } from "azure-devops-extension-api/Core"

import { useTeams } from "../../../hooks/useTeams"

type SelectTeamProps = {
  organization: string
  projectId: string
  onSelect: (team: WebApiTeam) => void
}
export function SelectTeam({
  organization,
  projectId,
  onSelect,
}: SelectTeamProps) {
  const { teams } = useTeams({ organization, projectId })

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedTeam = teams.find(item => item.id === e.target.value)
      if (selectedTeam) onSelect(selectedTeam)
    },
    [teams]
  )

  const teamsSorted = React.useMemo(() => {
    const items = [...teams]
    return items.reverse()
  }, [teams])

  return (
    <select onChange={onChange}>
      <option value={undefined}>--</option>
      {teamsSorted.map(item => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  )
}
