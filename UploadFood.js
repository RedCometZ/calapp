import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("NutritionDB.sqlite");

export default function UploadFood({ navigation }) {
  const [mode, setMode] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState(""); // grams

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          quantity REAL,
          unit TEXT,
          imageUri TEXT,
          createdAt INTEGER
        );`
      );
    });
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const handleUpload = () => {
    if (mode === "camera" && !imageUri) return Alert.alert("Select image first");
    if (!foodName) return Alert.alert("กรุณากรอกชื่ออาหาร");
    setLoading(true);
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO meals (name, quantity, unit, imageUri, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [foodName, quantity ? parseFloat(quantity) : null, "g", imageUri, Date.now()],
        () => {
          Alert.alert("Saved", "Meal logged!");
          navigation.goBack();
        },
        (_, error) => Alert.alert("DB Error", error.message)
      );
    });
    setLoading(false);
  };

  const handleVoiceCommand = () => {
    Alert.alert("Voice", "ฟีเจอร์สั่งการด้วยเสียงยังไม่พร้อมใช้งาน");
  };

  // --- UI ---
  if (!mode) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, marginBottom: 16 }}>เลือกวิธีเพิ่มอาหาร</Text>
        <Button title="ถ่ายรูป" onPress={() => setMode("camera")} />
        <Button title="สั่งการด้วยเสียง" onPress={() => setMode("voice")} />
        <Button title="เลือกด้วยตัวเอง" onPress={() => setMode("manual")} />
      </View>
    );
  }

  if (mode === "camera") {
    return (
      <View style={styles.container}>
        <Button title="Take Photo" onPress={takePhoto} />
        <Button title="Pick from Gallery" onPress={pickImage} />
        {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 10 }} />}
        <TextInput style={styles.input} placeholder="Food name" value={foodName} onChangeText={setFoodName} />
        <TextInput style={styles.input} placeholder="Quantity (g)" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        {loading ? <ActivityIndicator /> : <Button title="บันทึกอาหาร" onPress={handleUpload} />}
        <Button title="ย้อนกลับ" onPress={() => setMode(null)} />
      </View>
    );
  }

  if (mode === "voice") {
    return (
      <View style={styles.container}>
        <Text style={{ marginBottom: 16 }}>พูดชื่ออาหารและปริมาณ</Text>
        <Button title="เริ่มพูด" onPress={handleVoiceCommand} />
        <Button title="ย้อนกลับ" onPress={() => setMode(null)} />
      </View>
    );
  }

  if (mode === "manual") {
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Food name" value={foodName} onChangeText={setFoodName} />
        <TextInput style={styles.input} placeholder="Quantity (g)" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        {loading ? <ActivityIndicator /> : <Button title="บันทึกอาหาร" onPress={handleUpload} />}
        <Button title="ย้อนกลับ" onPress={() => setMode(null)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginVertical: 8, borderRadius: 6 }
});
