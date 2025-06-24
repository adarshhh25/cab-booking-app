// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const [asrLanguage, setAsrLanguage] = React.useState('en-US');
// const [showLanguageModal, setShowLanguageModal] = React.useState(false);

// const languages = [
//   { name: 'English', code: 'en-US' },
//   { name: 'Hindi', code: 'hi-IN' },
//   { name: 'Tamil', code: 'ta-IN' },
//   { name: 'Telugu', code: 'te-IN' },
//   { name: 'Bengali', code: 'bn-IN' },
//   { name: 'Gujarati', code: 'gu-IN' },
//   { name: 'Kannada', code: 'kn-IN' },
//   { name: 'Maithili', code: 'mai-IN' },
// ];


// const SettingsScreen = () => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const handleDeleteChats = () => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete all chats? This action cannot be undone.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleted chats') },
//       ]
//     );
//   };

//   const handleDeleteAccount = () => {
//     Alert.alert(
//       'Delete Account',
//       'Are you sure you want to delete your account?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Settings</Text>
//       </View>

//       <ScrollView style={styles.scroll}>
//         {/* App Settings Section */}
//         <Text style={styles.sectionTitle}>App Settings</Text>
//         <View style={styles.card}>
//       <TouchableOpacity
//           style={styles.row}
//           onPress={() => setShowLanguageModal(true)}>
//         <Icon name="translate" size={22} color="#29b6f6" style={styles.icon} />
//         <View>
//            <Text style={styles.title}>Preferred ASR Language</Text>
//            <Text style={styles.subText}>{asrLanguage}</Text>
//         </View>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.row}>
//             <Icon name="widgets" size={22} color="#29b6f6" style={styles.icon} />
//             <View>
//               <Text style={styles.title}>Connected Service</Text>
//               <Text style={styles.subText}>Manage access to apps linked with your assistant</Text>
//             </View>
//       </TouchableOpacity>
//         </View>

//         {/* Account Settings Section */}
//         <Text style={styles.sectionTitle}>Account Settings</Text>
//         <View style={styles.card}>
//           <TouchableOpacity style={styles.row} onPress={handleDeleteChats}>
//             <Icon name="chat-bubble-outline" size={22} color="#e53935" style={styles.icon} />
//             <View>
//               <Text style={[styles.title, { color: '#f44336' }]}>Delete All Chats</Text>
//               <Text style={styles.subText}>This will clear all your chats and cannot be recovered later.</Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
//             <Icon name="delete-outline" size={22} color="#e53935" style={styles.icon} />
//             <Text style={[styles.title, { color: '#f44336' }]}>Delete Account</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//       {/* Language Selection Modal */}
// {showLanguageModal && (
//   <View style={styles.modalOverlay}>
//     <View style={styles.languageModal}>
//       <Text style={styles.modalHeading}>Choose Language</Text>
//       {languages.map((lang) => (
//         <TouchableOpacity
//           key={lang.code}
//           style={styles.langOption}
//           onPress={() => {
//             setAsrLanguage(lang.code);
//             setShowLanguageModal(false);
//           }}
//         >
//           <Text style={styles.langText}>{lang.name}</Text>
//         </TouchableOpacity>
//       ))}
//       <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
//         <Text style={styles.cancelText}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// )}

//     </SafeAreaView>
//   );
// };

// export default SettingsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//   },
//   scroll: {
//     paddingHorizontal: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '600',
//     marginLeft: 15,
//   },
//   sectionTitle: {
//     color: '#aaa',
//     fontSize: 14,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   card: {
//     backgroundColor: '#1f1f1f',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     paddingVertical: 10,
//   },
//   icon: {
//     marginRight: 15,
//     marginTop: 2,
//   },
//   title: {
//     fontSize: 16,
//     color: '#fff',
//   },
//   subText: {
//     fontSize: 13,
//     color: '#aaa',
//     marginTop: 2,
//     marginRight: 20,
//   },
//   modalOverlay: {
//   position: 'absolute',
//   top: 0,
//   bottom: 0,
//   left: 0,
//   right: 0,
//   backgroundColor: 'rgba(0,0,0,0.6)',
//   justifyContent: 'center',
//   alignItems: 'center',
// },

// languageModal: {
//   backgroundColor: '#1f1f1f',
//   padding: 20,
//   borderRadius: 12,
//   width: '85%',
//   elevation: 10,
// },

// modalHeading: {
//   fontSize: 18,
//   color: '#fff',
//   fontWeight: 'bold',
//   marginBottom: 15,
//   textAlign: 'center',
// },

// langOption: {
//   paddingVertical: 10,
//   borderBottomWidth: 1,
//   borderBottomColor: '#333',
// },

// langText: {
//   color: '#fff',
//   fontSize: 16,
//   textAlign: 'center',
// },

// cancelText: {
//   color: '#f44336',
//   fontSize: 16,
//   marginTop: 15,
//   textAlign: 'center',
// },

// });


import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [asrLanguage, setAsrLanguage] = useState('en-US');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { name: 'English', code: 'en-US' },
    { name: 'Hindi', code: 'hi-IN' },
    { name: 'Tamil', code: 'ta-IN' },
    { name: 'Telugu', code: 'te-IN' },
    { name: 'Bengali', code: 'bn-IN' },
    { name: 'Gujarati', code: 'gu-IN' },
    { name: 'Kannada', code: 'kn-IN' },
    { name: 'Maithili', code: 'mai-IN' },
  ];

  const handleDeleteChats = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete all chats? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleted chats') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* App Settings Section */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowLanguageModal(true)}
          >
            <Icon name="translate" size={22} color="#29b6f6" style={styles.icon} />
            <View>
              <Text style={styles.title}>Preferred ASR Language</Text>
              <Text style={styles.subText}>{asrLanguage}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <Icon name="widgets" size={22} color="#29b6f6" style={styles.icon} />
            <View>
              <Text style={styles.title}>Connected Service</Text>
              <Text style={styles.subText}>Manage access to apps linked with your assistant</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteChats}>
            <Icon name="chat-bubble-outline" size={22} color="#e53935" style={styles.icon} />
            <View>
              <Text style={[styles.title, { color: '#f44336' }]}>Delete All Chats</Text>
              <Text style={styles.subText}>This will clear all your chats and cannot be recovered later.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Icon name="delete-outline" size={22} color="#e53935" style={styles.icon} />
            <Text style={[styles.title, { color: '#f44336' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <Text style={styles.modalHeading}>Choose Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langOption}
                onPress={() => {
                  setAsrLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={styles.langText}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    color: '#fff',
  },
  subText: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 2,
    marginRight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    elevation: 10,
  },
  modalHeading: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  langOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  langText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelText: {
    color: '#f44336',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});
