package com.devamitch.HealthPulse

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript.
   * CRITICAL: This MUST match the name in index.js AppRegistry.registerComponent()
   * 
   * Check your index.js for: AppRegistry.registerComponent('name', () => App)
   * If it says 'HealthPulse', use "HealthPulse" here (no space)
   * If it says 'HealthPulse', use "HealthPulse" here
   */
  override fun getMainComponentName(): String = "HealthPulse Health"

  /**
   * Returns the instance of the ReactActivityDelegate
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * ⚠️ CRITICAL FIX FOR GESTURES AND SCROLLING ⚠️
   * 
   * This override is REQUIRED for react-native-gesture-handler to work!
   * 
   * Why super.onCreate(null)?
   * - Passing null prevents double initialization of the React instance
   * - This is specifically required by react-native-gesture-handler
   * - Without this, touch events and gestures will not work properly
   * 
   * See: https://docs.swmansion.com/react-native-gesture-handler/docs/installation
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}