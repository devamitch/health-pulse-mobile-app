import Firebase
import FirebaseCore
import GoogleSignIn
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "HealthPulse Health",
      in: window,
      launchOptions: launchOptions
    )

    UNUserNotificationCenter.current().delegate = self

    return true
  }

  // Add this method to handle notification presentation
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.alert, .sound, .badge])
  }

  // Add this method to handle notification taps
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    // You can handle the notification tap here if needed, but Notifee handles it automatically
    completionHandler()
  }

  // Add this method for Google Sign-In URL handling
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // Handle Google Sign-In URL
    if GIDSignIn.sharedInstance.handle(url) {
      return true
    }

    if RCTLinkingManager.application(app, open: url, options: options) {
      return true
    }

    return false
  }

  // Optional: Add this method for Universal Links support
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
