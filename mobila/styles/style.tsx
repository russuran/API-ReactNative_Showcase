import { StyleSheet } from "react-native"

export default StyleSheet.create({
  rowItem: {
    flex: 1,
  },
  table: {
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  input: { flex: 1, paddingVertical: 8 },
  separator: {
    height: 1,
    backgroundColor: "lightgray",
    marginVertical: 8,
  },
  addButton: {
    alignSelf: "center",
    marginVertical: 16,
  },
  h1: {
    fontSize: 28,
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
})
