import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SensorChart from "../components/SensorChart";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>ข้อมูลจาก เซ็นเซอร์</Text>
      <SensorChart />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default HomeScreen;
