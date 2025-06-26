import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Account'>;

interface FavoriteLocation {
  name: string;
  address: string;
  coordinates?: any;
}

const AccountScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([
    { name: 'Home', address: 'Your home address' },
    { name: 'Work', address: 'Your work address' },
  ]);

  useEffect(() => {
    loadFavoriteLocations();
  }, []);

  useEffect(() => {
    // Check if a new favorite location was added
    if (route.params?.newFavoriteLocation) {
      const newLocation = route.params.newFavoriteLocation;
      addFavoriteLocation(newLocation);
    }
  }, [route.params]);

  const loadFavoriteLocations = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteLocations');
      if (stored) {
        const locations = JSON.parse(stored);
        setFavoriteLocations(locations);
      }
    } catch (error) {
      console.error('Error loading favorite locations:', error);
    }
  };

  const saveFavoriteLocations = async (locations: FavoriteLocation[]) => {
    try {
      await AsyncStorage.setItem('favoriteLocations', JSON.stringify(locations));
    } catch (error) {
      console.error('Error saving favorite locations:', error);
    }
  };

  const addFavoriteLocation = (newLocation: FavoriteLocation) => {
    const updatedLocations = [...favoriteLocations, newLocation];
    setFavoriteLocations(updatedLocations);
    saveFavoriteLocations(updatedLocations);
  };

  const handleAddFavoriteLocation = () => {
    navigation.navigate('AddFavoriteLocation');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={require('../assets/icons/user.png')}
              style={styles.profileImage}
            />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.name}>Adarsh Jha</Text>
              <Text style={styles.rating}>4.98</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.listItem}>
            <Icon name="credit-card" size={24} color="#fff" />
            <Text style={styles.listText}>Visa •••• 4242</Text>
          </View>
          <TouchableOpacity style={styles.addItem}>
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.listText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Favorite Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Locations</Text>
          {favoriteLocations.map((location, index) => (
            <View key={index} style={styles.listItem}>
              <Icon 
                name={location.name === 'Home' ? 'home' : location.name === 'Work' ? 'work' : 'location-on'} 
                size={24} 
                color="#fff" 
              />
              <View style={styles.locationInfo}>
                <Text style={styles.listText}>{location.name}</Text>
                {location.address && (
                  <Text style={styles.locationAddress}>{location.address}</Text>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addItem} onPress={handleAddFavoriteLocation}>
            <Icon name="add-location" size={24} color="#fff" />
            <Text style={styles.listText}>Add Favorite Location</Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.listItem}>
            <Icon name="keyboard-voice" size={24} color="#fff" />
            <Text style={styles.listText}>Voice Commands</Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="notifications" size={24} color="#fff" />
            <Text style={styles.listText}>Notifications</Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="language" size={24} color="#fff" />
            <Text style={styles.listText}>Language</Text>
          </View>
        </View>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rating: {
    fontSize: 14,
    color: '#aaa',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  listText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
  },
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});

export default AccountScreen;
