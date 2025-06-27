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
  const [locationAddressDebounceTimeout, setLocationAddressDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

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

      // Get current position with high accuracy
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Got current location:', latitude, longitude);
          
          // Get address from coordinates (reverse geocoding)
          const address = await getAddressFromCoordinates(latitude, longitude);
          
          // Set current location with coordinates and address
          setCurrentLocation({
            latitude,
            longitude,
            address
          });
          
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Current Location Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; height: 100%; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Initialize the map with default theme
            var map = L.map('map', {
                zoomControl: true,
                attributionControl: true
            }).setView([${latitude}, ${longitude}], 15);

            // Add default OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add a marker for current location
            var currentLocationMarker = L.marker([${latitude}, ${longitude}], {
                draggable: true
            }).addTo(map)
            .bindPopup('<b>Your Location</b><br>Drag to adjust')
            .openPopup();

            // Add a blue circle to highlight the area
            var circle = L.circle([${latitude}, ${longitude}], {
                color: '#2196F3',
                fillColor: '#2196F3',
                fillOpacity: 0.2,
                radius: 100
            }).addTo(map);

            // Update circle when marker is dragged
            currentLocationMarker.on('drag', function(e) {
                circle.setLatLng(e.target.getLatLng());
            });

            // Send message to React Native when marker position changes
            currentLocationMarker.on('dragend', function(e) {
                var position = e.target.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerDrag',
                    latlng: {
                        lat: position.lat.toFixed(6),
                        lng: position.lng.toFixed(6)
                    }
                }));
            });

            // Add click handler for map
            map.on('click', function(e) {
                // Move marker to clicked position
                currentLocationMarker.setLatLng(e.latlng);
                circle.setLatLng(e.latlng);
                
                // Send message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapClick',
                    latlng: {
                        lat: e.latlng.lat.toFixed(6),
                        lng: e.latlng.lng.toFixed(6)
                    }
                }));
            });

            // Fix for WebView rendering issues
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapClick' || data.type === 'markerDrag') {
        // Update current location with the new coordinates
        const newLat = parseFloat(data.latlng.lat);
        const newLng = parseFloat(data.latlng.lng);
        
        if (!isNaN(newLat) && !isNaN(newLng)) {
          setCurrentLocation(prev => ({
            ...prev!,
            latitude: newLat,
            longitude: newLng
          }));
          
          // Update coordinates text
          getAddressFromCoordinates(newLat, newLng)
            .then(address => {
              setLocationAddress(address);
            })
            .catch(error => {
              console.error('Error getting address:', error);
            });
        }
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  const handleLocationAddressChange = (text: string) => {
    setLocationAddress(text);
    
    // Debounce the geocoding request to avoid too many API calls
    if (locationAddressDebounceTimeout) {
      clearTimeout(locationAddressDebounceTimeout);
    }
    
    // Set a timeout to geocode the address after user stops typing
    setLocationAddressDebounceTimeout(
      setTimeout(() => {
        geocodeAddress(text);
      }, 1000)
    );
  };

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      console.log('Geocoding address:', address);
      
      // Use OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TripApp/1.0',
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          console.log('Geocoded coordinates:', latitude, longitude);
          
          // Update current location
          setCurrentLocation({
            latitude,
            longitude,
            address: display_name
          });
          
          // Update map if WebView is ready
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              // Update map view
              map.setView([${latitude}, ${longitude}], 15);
              
              // Update marker position
              currentLocationMarker.setLatLng([${latitude}, ${longitude}]);
              
              // Update circle position
              circle.setLatLng([${latitude}, ${longitude}]);
              
              true;
            `);
          }
        }
      } else {
        console.log('No results found for address:', address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
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
          <WebView
            ref={webViewRef}
            source={{ html: generateLeafletHTML(currentLocation.latitude, currentLocation.longitude) }}
            style={styles.webView}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <Icon name="map" size={48} color="#1e88e5" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
            onMessage={handleWebViewMessage}
          />
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
            onChangeText={handleLocationAddressChange}
            placeholder="Enter location address"
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
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
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default AddFavoriteLocationScreen;




















































