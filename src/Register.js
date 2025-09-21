// screens/Register.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../src/firebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [exercise, setExercise] = useState("low");
  const [goal, setGoal] = useState("maintain");

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Error", "ใส่อีเมลและรหัสผ่าน");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // save profile
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age, 10) : null,
        exercise,
        goal,
        createdAt: new Date()
      });

      // ส่ง email verification (optional)
      await sendEmailVerification(cred.user);

      Alert.alert("Registered", "สมัครเรียบร้อย โปรดยืนยันอีเมลของคุณ");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Register Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />

      <Text>Exercise</Text>
      <Picker selectedValue={exercise} onValueChange={(v)=>setExercise(v)}>
        <Picker.Item label="น้อย" value="low" />
        <Picker.Item label="ปานกลาง" value="medium" />
        <Picker.Item label="มาก" value="high" />
      </Picker>

      <Text>Goal</Text>
      <Picker selectedValue={goal} onValueChange={(v)=>setGoal(v)}>
        <Picker.Item label="รักษาน้ำหนัก" value="maintain" />
        <Picker.Item label="ลดน้ำหนัก" value="lose" />
        <Picker.Item label="เพิ่มกล้าม" value="gain" />
      </Picker>

      <Button title="Register" onPress={handleRegister} />
      <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:20, justifyContent:"center"},
  title:{fontSize:20, textAlign:"center", marginBottom:10},
  input:{borderWidth:1, borderColor:"#ccc", padding:8, marginBottom:8, borderRadius:6}
});
