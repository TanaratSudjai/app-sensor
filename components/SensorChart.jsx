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
        const processedData = processSensorData(response.data);
        setData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processSensorData = (sensorData) => {
    if (!Array.isArray(sensorData)) {
      console.error("Invalid data format:", sensorData);
      return [];
    }

    // กรองข้อมูลตามช่วงเวลา (ตัวอย่าง: 24 ชั่วโมง)
    const filteredData = sensorData.filter((entry) => {
      // ตัวอย่าง: กรองข้อมูลเฉพาะ 24 ชั่วโมงล่าสุด
      if (selectedTimeRange === "24 ชั่วโมง") {
        // เพิ่มเงื่อนไขการกรองตามเวลา
        return true; // แทนที่ด้วยเงื่อนไขจริง
      }
      return true;
    });

    return filteredData.map((entry) => ({
      time: entry.time || "Unknown",
      temperature: entry.temperature || 0,
      humidity: entry.humidity || 0,
      co2: entry.co2 || 0,
      ec: entry.ec || 0,
      pH: entry.pH || 0,
      vpo: entry.vpo || 0,
      dewPoint: entry.dewPoint || 0,
    }));
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    // คุณสามารถเพิ่มการกรองข้อมูลตามช่วงเวลาได้ที่นี่
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>ระบบตรวจจับความผิดปกติของเซ็นเซอร์</Text>

      {/* Time Range Selection */}
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

      {/* Variable Selection */}
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

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: data.map((entry) => entry.time),
            datasets: [
              {
                data: data.map((entry) => entry[selectedVariable]),
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
