import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Home({ navigation }) {
  const [water, setWater] = useState(0);
  const [summary, setSummary] = useState({
    date: new Date().toISOString().slice(0, 10),
    kcal: 0,
    protein: 0,
    fat: 0,
    carb: 0,
  });
  const [meals, setMeals] = useState([
    { id: "1", title: "มื้อเช้า", icon: "sunny", color: "#FFD580", kcal: 0 },
    { id: "2", title: "มื้อกลางวัน", icon: "fast-food", color: "#FFB347", kcal: 0 },
    { id: "3", title: "มื้อเย็น", icon: "moon", color: "#87CEFA", kcal: 0 },
    { id: "4", title: "มื้ออื่นๆ", icon: "ice-cream", color: "#C3B1E1", kcal: 0 },
  ]);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!auth.currentUser) return;
      const today = new Date().toISOString().slice(0, 10);
      const q = query(
        collection(db, "meals"),
        where("uid", "==", auth.currentUser.uid),
        where("date", "==", today)
      );
      const snapshot = await getDocs(q);

      // สรุปข้อมูล
      let totalKcal = 0, totalProtein = 0, totalFat = 0, totalCarb = 0;
      const mealMap = { breakfast: 0, lunch: 1, dinner: 2, other: 3 };
      const newMeals = [...meals].map(m => ({ ...m, kcal: 0 }));

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        totalKcal += data.kcal || 0;
        totalProtein += data.protein || 0;
        totalFat += data.fat || 0;
        totalCarb += data.carb || 0;
        const idx = mealMap[data.mealType];
        if (idx !== undefined) {
          newMeals[idx].kcal += data.kcal || 0;
        }
      });

      setSummary({
        date: today,
        kcal: totalKcal,
        protein: totalProtein,
        fat: totalFat,
        carb: totalCarb,
      });
      setMeals(newMeals);
    };

    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      {/* สรุปข้อมูลวันนี้ */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryDate}>วันที่ {summary.date}</Text>
        <Text style={styles.summaryText}>พลังงาน {summary.kcal} kcal</Text>
        <Text style={styles.summaryText}>โปรตีน {summary.protein} g | ไขมัน {summary.fat} g | คาร์บ {summary.carb} g</Text>
      </View>

      <Text style={styles.greet}>สวัสดี 👋</Text>
      <Text style={styles.subText}>วันนี้คุณกินไปแล้ว {summary.kcal} kcal</Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={28} color="#333" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text>รวม: {item.kcal} kcal</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate("UploadFood", { mealId: item.id })}
            >
              <Text style={{ color: "#fff" }}>+ เพิ่ม</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.waterBox}>
        <Text style={styles.waterTitle}>การดื่มน้ำ 💧</Text>
        <Text style={styles.waterText}>{water} / 8 แก้ว</Text>
        <View style={styles.waterRow}>
          {[...Array(8)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setWater(i + 1)}
              style={[
                styles.glass,
                { backgroundColor: i < water ? "#00BFFF" : "#E0E0E0" },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={24} color="#333" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("History")}>
          <Ionicons name="list" size={24} color="#333" />
          <Text style={styles.menuText}>ประวัติการกิน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person" size={24} color="#333" />
          <Text style={styles.menuText}>ผู้ใช้</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings" size={24} color="#333" />
          <Text style={styles.menuText}>ตั้งค่า</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", paddingBottom: 80 },
  summaryBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryDate: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  summaryText: { fontSize: 15, marginBottom: 2 },
  greet: { fontSize: 22, fontWeight: "bold" },
  subText: { color: "#555", marginBottom: 15 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  waterBox: {
    marginTop: 20,
    marginBottom: 10,
    padding: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },
  waterTitle: { fontSize: 18, fontWeight: "bold" },
  waterText: { marginVertical: 8, fontSize: 16 },
  waterRow: { flexDirection: "row", flexWrap: "wrap" },
  glass: {
    width: 30,
    height: 50,
    borderRadius: 5,
    margin: 4,
  },
  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuBtn: {
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
});
