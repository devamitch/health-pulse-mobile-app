export interface MediaData{
  createdAt: string;
  fileName: string;
  fileUrl: string;
  other: string;
  updatedAt: string;
  __v: number;
  _id: string;
  title: string;
  description: string;
};

export interface NotificationData {
  _id: string;
  type: string;
  time: string;
  device_token: string;
  title: string;
  body: string;
  userId: string;
  channel: string;
  frequency: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  status: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface CDNRequestProps {
    id: string;
}

export interface NotificationRequestByIDProps {
    id: string;
}

export interface NotificationRequestByUserProps{
    userId: string;
}

export interface NotificationRequestByUserAndChannelProps{
    userId: string;
    channel: string;
}

export type PatchNotificationProps = Partial<
    Omit<NotificationData, 'userId' | 'status' | 'sentAt' | 'createdAt' | 'updatedAt' | '__v' | '_id'>
> & {_id: string}

export interface TimeSeriesRequest {
    from_timestamp: string;
    to_timestamp: string;
    metric: string;
    providers?: string[];
}

export interface TimeSeriesPoint {
    timestamp: string;
    value: number;
}

export interface TimeSeriesResponse {
    metric: string;
    from_timestamp: string;
    to_timestamp: string;
    providers: string[];
    provider_sources: string[];
    data: TimeSeriesPoint[];
}

export interface SignUpProps {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface SignUpResponseProps {
  status: string;
  message: string;
}

export interface SignInProps {
  email: string;
  password: string;
}

export interface ResetPasswordProps {
  email: string;
  newPassword: string;
  resetToken?: string;
}

export interface GoogleAuthProps {
  idToken: string;
}

export interface AppleAuthProps {
  idToken: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdatePasswordProps {
  oldPassword: string;
  newPassword: string;
}

export interface DeleteAccountProps {
  appleIdToken: string;
}

export interface UpdateUserProfileParams {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profilePhoto?: string;
}

export interface UserProfileProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  role: string;
  provider: string;
  isEmailVerified: boolean;
  profilePhoto?: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface AuthResponseType {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  id: string;
  profilePhoto: string;
  token: string;
  refreshToken: string;
  mobileNumber: string;
}

export interface VerifyOTPProps {
  email: string;
  otp: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface OTPEmailProp {
  email: string;
}

export interface PlaylistInfoResponse {
  _id: string;
  title: string;
}

export interface VideoItem {
  id: string;
  assetId: string;
  title: string;
  duration: number;
  playbackUrl: string;
  thumbnailUrl: string;
  tag: string[];
}

export interface PlaylistParam {
  title: string;
}
