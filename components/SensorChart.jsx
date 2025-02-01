import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;

const SensorDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24 ชั่วโมง");
  const [selectedVariable, setSelectedVariable] = useState("temperature");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://raw.githubusercontent.com/Thitareeee/mock-senser-data/main/sensor_mock_data_varied_errors.json"
        );
        setData(response.data);
        filterData(response.data, "24 ชั่วโมง");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterData = (sensorData, timeRange) => {
    if (!sensorData || sensorData.length === 0) return;

    const latestTimestamp = Math.max(
      ...sensorData.map((entry) => new Date(entry.timestamp).getTime())
    );
    const latestDate = new Date(latestTimestamp);

    let filtered = [];

    if (timeRange === "24 ชั่วโมง") {
      const last24Hours = new Date(latestDate.getTime() - 24 * 60 * 60 * 1000);
      filtered = sensorData.filter(
        (entry) => new Date(entry.timestamp) >= last24Hours
      );
    } else if (timeRange === "7 วัน") {
      const last7Days = new Date(
        latestDate.getTime() - 7 * 24 * 60 * 60 * 1000
      );
      filtered = sensorData.filter(
        (entry) => new Date(entry.timestamp) >= last7Days
      );
    } else if (timeRange === "30 วัน") {
      const last30Days = new Date(
        latestDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      filtered = sensorData.filter(
        (entry) => new Date(entry.timestamp) >= last30Days
      );
    } else {
      filtered = sensorData;
    }

    setFilteredData(filtered);
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    filterData(data, range);
  };

  const handleVariableChange = (variable) => {
    setSelectedVariable(variable);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const graphData = filteredData
    .filter((entry) => entry[selectedVariable] !== undefined)
    .map((entry) => entry[selectedVariable]);

  const graphLabels = filteredData
    .filter((entry) => entry.time !== undefined)
    .map((entry) => entry.time);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>ระบบตรวจจับความผิดปกติของเซ็นเซอร์</Text>

      <View style={styles.timeRangeContainer}>
        {["24 ชั่วโมง", "7 วัน", "30 วัน", "ทั้งหมด"].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range && styles.timeRangeButtonSelected,
            ]}
            onPress={() => handleTimeRangeChange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedTimeRange === range && styles.timeRangeTextSelected,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.variableContainer}>
        {[
          { label: "อุณหภูมิ (°C)", key: "temperature" },
          { label: "ความชื้น (%)", key: "humidity" },
          { label: "VPO", key: "vpo" },
          { label: "จุดน้ำค้าง (°C)", key: "dewPoint" },
          { label: "EC", key: "ec" },
          { label: "pH", key: "pH" },
          { label: "CO2 (ppm)", key: "co2" },
        ].map((variable) => (
          <TouchableOpacity
            key={variable.key}
            style={[
              styles.variableButton,
              selectedVariable === variable.key &&
                styles.variableButtonSelected,
            ]}
            onPress={() => handleVariableChange(variable.key)}
          >
            <Text
              style={[
                styles.variableText,
                selectedVariable === variable.key &&
                  styles.variableTextSelected,
              ]}
            >
              {variable.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: graphLabels,
            datasets: [
              {
                data: graphData,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              },
            ],
          }}
          width={screenWidth - 40}
          height={300}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  timeRangeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  timeRangeButtonSelected: {
    backgroundColor: "#007bff",
  },
  timeRangeText: {
    color: "#000",
  },
  timeRangeTextSelected: {
    color: "#fff",
  },
  variableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  variableButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    margin: 5,
  },
  variableButtonSelected: {
    backgroundColor: "#007bff",
  },
  variableText: {
    color: "#000",
  },
  variableTextSelected: {
    color: "#fff",
  },
  chartContainer: {
    marginVertical: 20,
  },
});

export default SensorDashboard;
