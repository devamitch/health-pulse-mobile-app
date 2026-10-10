import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PhonePreviewProps {
  theme: 'light' | 'dark' | 'system';
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const isSystem = theme === 'system';

  return (
    <View style={[styles.phonePreview, isDark && { backgroundColor: '#1C1C1E' }]}>
      <View style={styles.phoneScreen}>
        <View style={styles.phoneBar} />
        <View 
          style={[
            styles.phoneContent, 
            { backgroundColor: isDark ? '#48484A' : '#E5E5EA' }
          ]} 
        />
        <View 
          style={[
            styles.phoneContent, 
            { 
              backgroundColor: isSystem ? '#48484A' : isDark ? '#48484A' : '#E5E5EA',
              marginTop: 4 
            }
          ]} 
        />
        <View 
          style={[
            styles.phoneButton, 
            { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  phonePreview: {
    width: 70,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  phoneScreen: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  phoneBar: {
    height: 3,
    width: 20,
    backgroundColor: '#000',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 8,
  },
  phoneContent: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  phoneButton: {
    height: 8,
    width: 24,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginTop: 'auto',
    marginBottom: 4,
    alignSelf: 'center',
  },
});

export default PhonePreview;
