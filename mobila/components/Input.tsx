// react native styled input component

import React from "react"
import { TextInput, TextInputProps, View, Text, StyleSheet } from "react-native"

export default function Input(props: { label?: string } & TextInputProps) {
  return (
    <View style={[{ gap: 4, justifyContent: "center" }, props.style]}>
      {props.label && <Text style={{ fontSize: 16, color: "#444" }}>{props.label}</Text>}
      <TextInput {...props} style={[style.input, props.style]} placeholderTextColor="gray" />
    </View>
  )
}

const style = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderRadius: 4,
    width: 240,
    borderColor: "#999",
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "white",
    fontSize: 16,
  },
})
