// screens/UploadFood.js
import React, { useState } from "react";
import { View, Text, Button, Image, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { auth, storage, db } from "../src/firebaseConfig";

export default function UploadFood({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState(""); // grams
  const uid = auth.currentUser?.uid;

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.cancelled) setImageUri(res.uri);
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.cancelled) setImageUri(res.uri);
  };

  // Helper: convert local uri -> blob (for web SDK upload)
  const uriToBlob = async (uri) => {
    const resp = await fetch(uri);
    const blob = await resp.blob();
    return blob;
  };

  const handleUpload = async () => {
    if (!imageUri) return Alert.alert("Select image first");
    if (!foodName) return Alert.alert("กรุณากรอกชื่ออาหาร");
    setLoading(true);
    try {
      const blob = await uriToBlob(imageUri);
      const filename = `meals/${uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      // For demo: we don't compute nutrition here. Save basic mealLog:
      await addDoc(collection(db, "mealLogs"), {
        uid,
        createdAt: new Date(),
        foods: [{
          name: foodName,
          quantity: quantity ? parseFloat(quantity) : null,
          unit: "g",
          imageUrl: url,
          // calories/protein/etc can be filled by nutrition API later
        }]
      });

      Alert.alert("Saved", "Meal logged!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Upload error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick from Gallery" onPress={pickImage} />
      {imageUri && <Image source={{uri:imageUri}} style={{width:200,height:200,marginTop:10}} />}
      <TextInput style={styles.input} placeholder="Food name" value={foodName} onChangeText={setFoodName} />
      <TextInput style={styles.input} placeholder="Quantity (g)" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
      {loading ? <ActivityIndicator/> : <Button title="Upload & Save meal" onPress={handleUpload} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20},
  input:{borderWidth:1,borderColor:"#ccc",padding:8,marginVertical:8,borderRadius:6}
});
