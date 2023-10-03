import React from "react"

import { TextField, TextFieldWidth } from "azure-devops-ui/TextField"

import "./SelectDateRange.css"

type SelectDateRangeProps = {
  minDate: string
  maxDate: string
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}
export default function SelectDateRange({
  minDate,
  maxDate,
  startDate,
  endDate,
  onChange,
}: SelectDateRangeProps) {
  const refStartDate = React.useRef<HTMLTextAreaElement & HTMLInputElement>(
    null
  )
  const refEndDate = React.useRef<HTMLTextAreaElement & HTMLInputElement>(null)

  React.useEffect(() => {
    if (minDate && refStartDate.current && refEndDate.current) {
      refStartDate.current.min = minDate
      refStartDate.current.max = maxDate
    }
    if (maxDate && refStartDate.current && refEndDate.current) {
      refEndDate.current.min = minDate
      refEndDate.current.max = maxDate
    }
  }, [minDate, maxDate])

  return (
    <div className="select-daterange">
      <TextField
        className="select-daterange_input"
        // @ts-ignore
        inputType="date"
        value={startDate}
        onChange={(e, value) => onChange(value, endDate)}
        width={TextFieldWidth.auto}
        inputElement={refStartDate}
      />
      <span className="select-daterange_divider">-</span>
      <TextField
        className="select-daterange_input"
        // @ts-ignore
        inputType="date"
        value={endDate}
        onChange={(e, value) => onChange(startDate, value)}
        width={TextFieldWidth.auto}
        inputElement={refEndDate}
      />
    </div>
  )
}
