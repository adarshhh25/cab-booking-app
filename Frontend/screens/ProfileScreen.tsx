import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        <Image
          source={require('../assets/icons/user.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Adarsh Jha</Text>
        <Text style={styles.email}>adarsh@example.com</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Membership</Text>
          <Text style={styles.infoValue}>Premium User</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Mobile Number</Text>
          <Text style={styles.infoValue}>+91 1234567890</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Location</Text>
          <Text style={styles.infoValue}>Mumbai, India</Text>
        </View>
      </View>
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
  content: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
  },
  infoBox: {
    width: '80%',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  infoTitle: {
    fontSize: 16,
    color: '#aaa',
  },
  infoValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
