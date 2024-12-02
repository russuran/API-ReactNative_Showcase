import { useState } from "react"
import { Dropdown } from "react-native-element-dropdown"
export default function SearchDropdown({
  items,
  value,
  setValue,
  placeholder,
  style,
  labelField = "name",
  valueField = "name",
}: {
  items: any[]
  setValue: (value: string | null) => void
  value: string | null
  placeholder: string
  style?: any
  labelField?: string
  valueField?: string
}) {
  const [isFocus, setIsFocus] = useState(false)

  return (
    <Dropdown
      containerStyle={{ width: 320, position: "relative" }}
      style={[{ minWidth: 80, maxWidth: 320 }, style]}
      selectedTextStyle={{ fontSize: 16 }}
      data={items}
      search
      maxHeight={300}
      labelField={labelField}
      valueField={valueField}
      placeholder={placeholder}
      searchPlaceholder="Поиск"
      placeholderStyle={{ color: "gray" }}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        setValue(item[valueField])
        setIsFocus(false)
      }}
    />
  )
}
