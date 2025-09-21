import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

export default function History() {
  // mockup ข้อมูล
  const [history] = useState({
    "2025-09-19": [
      { title: "มื้อเช้า", kcal: 320 },
      { title: "มื้อกลางวัน", kcal: 600 },
      { title: "มื้อเย็น", kcal: 450 },
    ],
    "2025-09-18": [
      { title: "มื้อเช้า", kcal: 280 },
      { title: "มื้อกลางวัน", kcal: 550 },
      { title: "มื้อเย็น", kcal: 400 },
    ],
  });
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ประวัติการกินย้อนหลัง</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...Object.keys(history).reduce((acc, date) => {
            acc[date] = { marked: true };
            return acc;
          }, {}),
          ...(selectedDate
            ? { [selectedDate]: { selected: true, marked: true } }
            : {}),
        }}
        style={styles.calendar}
      />
      {selectedDate && history[selectedDate] ? (
        <View style={styles.card}>
          <Text style={styles.date}>{selectedDate}</Text>
          {history[selectedDate].map((meal, idx) => (
            <Text key={idx} style={styles.meal}>
              {meal.title}: {meal.kcal} kcal
            </Text>
          ))}
        </View>
      ) : selectedDate ? (
        <View style={styles.card}>
          <Text style={styles.date}>{selectedDate}</Text>
          <Text style={styles.meal}>ไม่มีข้อมูลอาหาร</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  calendar: { marginBottom: 16 },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  date: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  meal: { fontSize: 15, marginBottom: 2 },
});