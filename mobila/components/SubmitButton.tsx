import React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"

const SubmitButton = (props: any) => {
  return (
    <TouchableOpacity {...props} style={[styles.button, props.style]}>
      <Text style={styles.buttonText}>{props.text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2680ea",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default SubmitButton
