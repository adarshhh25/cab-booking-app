// screens/ContactScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Contact'>;

const ContactScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    feedback: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    // For now just log the form (you can later connect to backend)
    console.log('Feedback Form Submitted:', form);
    alert('Thank you for your feedback!');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {['name', 'email', 'phone', 'subject', 'feedback'].map((field) => (
          <TextInput
            key={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            placeholderTextColor="#aaa"
            style={[
              styles.input,
              field === 'feedback' ? styles.multilineInput : null,
            ]}
            value={form[field as keyof typeof form]}
            onChangeText={(text) => handleChange(field as keyof typeof form, text)}
            multiline={field === 'feedback'}
            numberOfLines={field === 'feedback' ? 4 : 1}
          />
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1e88e5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactScreen;
