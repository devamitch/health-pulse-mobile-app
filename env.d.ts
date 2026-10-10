declare module '@env' {
  // Define all your environment variables here
  export const APP_STORE_SECRET: string;
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const APPLE_SERVICE_ID: string;
  export const API_BASE_URL: string;
  export const API_KEY: string;
  export const CLAUDE_API: string;
  export const OPENAI_API: string;
  export const BACK_END: string;
  export const AUTH_BACK_END: string;
  export const SPIKE_API_HMAC_KEY: string;
}

declare module '*.png' {
  const content: any;
  export default content;
}
