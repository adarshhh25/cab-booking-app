import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddFavoriteLocation'>;

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

const AddFavoriteLocationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [locationAddress, setLocationAddress] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Request location permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show current position.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
          setIsLoading(false);
          return;
        }
      }

      // Get current position
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location: Location = { latitude, longitude };
          
          // Get address from coordinates (reverse geocoding)
          const address = await getAddressFromCoordinates(latitude, longitude);
          location.address = address;
          
          setCurrentLocation(location);
          setLocationAddress(address);
          setIsLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      console.error('Location permission error:', error);
      setIsLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Try multiple geocoding services for better reliability
      const services = [
        {
          name: 'BigDataCloud',
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          parser: (data: any) => data?.display_name || (data?.locality ?
            `${data.locality}, ${data.city || data.principalSubdivision || ''}`.replace(/, $/, '') : null)
        },
        {
          name: 'OpenStreetMap',
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          parser: (data: any) => data?.display_name || null
        }
      ];

      for (const service of services) {
        try {
          console.log(`Trying ${service.name} geocoding service...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'TripApp/1.0',
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          const address = service.parser(data);

          if (address && address.trim()) {
            console.log(`Successfully got address from ${service.name}:`, address);
            return address.trim();
          }
        } catch (serviceError) {
          console.warn(`${service.name} geocoding failed:`, serviceError);
          continue; // Try next service
        }
      }

      // If all services fail, return coordinates
      console.log('All geocoding services failed, returning coordinates');
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const handleSave = () => {
    if (!locationName.trim()) {
      Alert.alert('Missing Information', 'Please provide a name for this location.');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get current location. Please try again.');
      return;
    }

    // Here you would typically save to your app's storage/database
    // For now, we'll just show a success message and navigate back
    Alert.alert(
      'Location Saved!',
      `"${locationName}" has been added to your favorite locations.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Pass the new location back to AccountScreen
            navigation.navigate('Account', {
              newFavoriteLocation: {
                name: locationName,
                address: locationAddress,
                coordinates: currentLocation,
              }
            });
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const generateLeafletHTML = (latitude: number, longitude: number) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Current Location Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Initialize the map
            var map = L.map('map').setView([${latitude}, ${longitude}], 16);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Add a marker for current location
            var currentLocationMarker = L.marker([${latitude}, ${longitude}])
                .addTo(map)
                .bindPopup('<b>Your Current Location</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}')
                .openPopup();

            // Add a red circle to highlight the area
            var circle = L.circle([${latitude}, ${longitude}], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.2,
                radius: 100
            }).addTo(map);

            // Disable zoom controls for better mobile experience
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();

            // Add click handler for map
            map.on('click', function(e) {
                // You can add functionality here if needed
                console.log('Map clicked at: ' + e.latlng);
            });
        </script>
    </body>
    </html>
    `;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Favorite Location</Text>
      </View>

      {/* Map Section (Top Half) */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="location-searching" size={48} color="#1e88e5" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : currentLocation ? (
          <View style={styles.mapPlaceholder}>
            <Icon name="location-on" size={64} color="#e53e3e" />
            <Text style={styles.coordinatesText}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.mapNote}>📍 Current Location Detected</Text>
            <Text style={styles.mapNote}>Interactive map will load here</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {
                // Future: Open full map view
                Alert.alert('Map Feature', 'Interactive map coming soon!');
              }}
            >
              <Icon name="map" size={24} color="#1e88e5" />
              <Text style={styles.mapButtonText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="location-off" size={48} color="#666" />
            <Text style={styles.errorText}>Unable to get location</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Form Section (Bottom Half) */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Location Details</Text>
        
        {/* Current Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Location</Text>
          <TextInput
            style={styles.input}
            value={locationAddress}
            onChangeText={setLocationAddress}
            placeholder="Current location address"
            placeholderTextColor="#666"
            multiline
          />
        </View>

        {/* Location Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location Name</Text>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Provide a name to this place"
            placeholderTextColor="#666"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1e88e5',
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 14,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 14,
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  coordinatesText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  mapNote: {
    color: '#666',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e88e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  mapButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AddFavoriteLocationScreen;
