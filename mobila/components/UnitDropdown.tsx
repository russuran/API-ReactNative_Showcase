import { useState } from "react"
import { Dropdown } from "react-native-element-dropdown"

function UnitDropdown({ setUnit }: { setUnit: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>("1")
  const [isFocus, setIsFocus] = useState(false)

  const items = [
    { label: "мешков (25кг)", value: "25" },
    // { label: "Поддонов (150кг)", value: "150" },
    { label: "кг", value: "1" },
  ]

  return (
    <Dropdown
      containerStyle={{ minWidth: 112, maxWidth: 320 }}
      style={{ minWidth: 112, maxWidth: 320 }}
      data={items}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={"Единица измерения"}
      searchPlaceholder="Поиск"
      placeholderStyle={{ color: "gray" }}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        setValue(item.value)
        setIsFocus(false)
        setUnit(item.value)
      }}
    />
  )
}

export default UnitDropdown
