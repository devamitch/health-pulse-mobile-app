// TEST FILE - Add this to a component to test your toasts
// For example, add this button to your home screen

import { Toast } from '@/utils/toast';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ToastTester = () => {
  const testAllToasts = () => {
    console.log('🧪 Testing all toast types...');

    // Test 1: Basic toast
    setTimeout(() => {
      Toast('Basic toast message');
      console.log('✓ Basic toast called');
    }, 0);

    // Test 2: Success toast
    setTimeout(() => {
      Toast.success('Success! Everything worked perfectly 🎉');
      console.log('✓ Success toast called');
    }, 1000);

    // Test 3: Error toast
    setTimeout(() => {
      Toast.error('Oops! Something went wrong 😞');
      console.log('✓ Error toast called');
    }, 2000);

    // Test 4: Warning toast
    setTimeout(() => {
      Toast.warning('Warning: Please be careful! ⚠️');
      console.log('✓ Warning toast called');
    }, 3000);

    // Test 5: Info toast
    setTimeout(() => {
      Toast.info('Did you know? This is an info toast! 💡');
      console.log('✓ Info toast called');
    }, 4000);

    // Test 6: Confetti toast
    setTimeout(() => {
      Toast.confetti('Congratulations! You did it! 🎊');
      console.log('✓ Confetti toast called');
    }, 5000);

    // Test 7: Helper method
    setTimeout(() => {
      Toast.levelUp(42);
      console.log('✓ Level up toast called');
    }, 6000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testAllToasts}>
        <Text style={styles.buttonText}>🧪 Test All Toasts</Text>
      </TouchableOpacity>

      <View style={styles.individualButtons}>
        <TouchableOpacity
          style={[styles.smallButton, styles.successButton]}
          onPress={() => Toast.success('Success!')}
        >
          <Text style={styles.smallButtonText}>✅ Success</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, styles.errorButton]}
          onPress={() => Toast.error('Error!')}
        >
          <Text style={styles.smallButtonText}>❌ Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, styles.warningButton]}
          onPress={() => Toast.warning('Warning!')}
        >
          <Text style={styles.smallButtonText}>⚠️ Warning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, styles.infoButton]}
          onPress={() => Toast.info('Info!')}
        >
          <Text style={styles.smallButtonText}>ℹ️ Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, styles.confettiButton]}
          onPress={() => Toast.confetti('Party! 🎉')}
        >
          <Text style={styles.smallButtonText}>🎊 Confetti</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  individualButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  confettiButton: {
    backgroundColor: '#EC4899',
  },
});
