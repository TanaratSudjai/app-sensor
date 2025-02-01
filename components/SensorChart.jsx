import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;

const SensorDashboard = () => {
  // State management
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24 ชั่วโมง");
  const [selectedVariable, setSelectedVariable] = useState("temperature");
  const [scaleValue] = useState(new Animated.Value(1));

  // Constants
  const TIME_RANGES = ["24 ชั่วโมง", "7 วัน", "30 วัน", "ทั้งหมด"];
  const VARIABLES = [
    { label: "อุณหภูมิ (°C)", key: "temperature" },
    { label: "ความชื้น (%)", key: "humidity" },
    { label: "VPO", key: "vpo" },
    { label: "จุดน้ำค้าง (°C)", key: "dewPoint" },
    { label: "EC", key: "ec" },
    { label: "pH", key: "pH" },
    { label: "CO2 (ppm)", key: "co2" },
  ];

  // Animation functions
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://raw.githubusercontent.com/Thitareeee/mock-senser-data/main/sensor_mock_data_varied_errors.json"
        );
        setData(response.data);
        filterData(response.data, "24 ชั่วโมง");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data filtering
  const filterData = (sensorData, timeRange) => {
    if (!sensorData?.length) return;

    const latestTimestamp = Math.max(
      ...sensorData.map((entry) => new Date(entry.timestamp).getTime())
    );
    const latestDate = new Date(latestTimestamp);
    let filtered;

    switch (timeRange) {
      case "24 ชั่วโมง":
        filtered = sensorData.filter(
          (entry) =>
            new Date(entry.timestamp) >=
            new Date(latestDate.getTime() - 24 * 60 * 60 * 1000)
        );
        break;
      case "7 วัน":
        filtered = sensorData.filter(
          (entry) =>
            new Date(entry.timestamp) >=
            new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case "30 วัน":
        filtered = sensorData.filter(
          (entry) =>
            new Date(entry.timestamp) >=
            new Date(latestDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        );
        break;
      default:
        filtered = sensorData;
    }

    setFilteredData(filtered);
  };

  // Event handlers
  const handleTimeRangeChange = (range) => {
    animatePress();
    setSelectedTimeRange(range);
    filterData(data, range);
  };

  const handleVariableChange = (variable) => {
    animatePress();
    setSelectedVariable(variable);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // Prepare chart data
  const graphData = filteredData
    .filter((entry) => entry[selectedVariable] !== undefined)
    .map((entry) => entry[selectedVariable]);

  const graphLabels = filteredData
    .filter((entry) => entry.time !== undefined)
    .map((entry) => entry.time);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>ระบบตรวจจับความผิดปกติของเซ็นเซอร์</Text>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {TIME_RANGES.map((range) => (
          <Animated.View 
            key={range} 
            style={{ transform: [{ scale: scaleValue }] }}
          >
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonSelected,
              ]}
              onPress={() => handleTimeRangeChange(range)}
              activeOpacity={0.7}
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
          </Animated.View>
        ))}
      </View>

      {/* Variable Selector */}
      <View style={styles.variableContainer}>
        {VARIABLES.map((variable) => (
          <Animated.View 
            key={variable.key}
            style={{ transform: [{ scale: scaleValue }] }}
          >
            <TouchableOpacity
              style={[
                styles.variableButton,
                selectedVariable === variable.key && styles.variableButtonSelected,
              ]}
              onPress={() => handleVariableChange(variable.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.variableText,
                  selectedVariable === variable.key && styles.variableTextSelected,
                ]}
              >
                {variable.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: graphLabels,
            datasets: [
              {
                data: graphData.length ? graphData : [0],
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 40}
          height={300}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#4A90E2",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#2C3E50",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  timeRangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeRangeButtonSelected: {
    backgroundColor: "#4A90E2",
    elevation: 4,
  },
  timeRangeText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "600",
  },
  timeRangeTextSelected: {
    color: "#ffffff",
  },
  variableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
    paddingHorizontal: 10,
  },
  variableButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  variableButtonSelected: {
    backgroundColor: "#4A90E2",
    elevation: 4,
  },
  variableText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  variableTextSelected: {
    color: "#ffffff",
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default SensorDashboard;
