import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppleAuthProps, AuthResponseType, DeleteAccountProps, GoogleAuthProps, LogoutResponse, OTPEmailProp, RefreshTokenResponse, ResetPasswordProps, SignInProps, SignUpProps, SignUpResponseProps, UpdatePasswordProps, UpdatePasswordResponse, UpdateUserProfileParams, UserProfileProps, VerifyOTPProps } from "./interfaces";
import { AUTH_BACK_END } from "@env";
import { RootState } from "..";

const appSlug = 'HealthPulse' as const;

export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: [
    "emailSignup",
    "emailLogin",
    "google",
    "apple",
    "updatePassword",
    "verifyNewUserOTP",
    "verifyForgotPasswordOTP",
    "forgotPassword",
    "resetPassword",
    "refereshToken",
    "logout",
    "deleteAccount",
    "resendNewUserOTP",
    "resendForgotPasswordOTP",
    "resendDeleteAccountOTP",
    "verifyDeleteAccountOTP",
    "updateUserProfile",
    "getUserProfile"
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_BACK_END,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      headers.set("Content-Type", "application/json");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Authentication APIs
    signup: builder.mutation<SignUpResponseProps, SignUpProps>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ["emailSignup"],
    }),
    login: builder.mutation<AuthResponseType, SignInProps>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ["emailLogin"],
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, {token: string}>({
      query: (body) => ({
        url: "/auth/refresh",
        method: 'POST',
        body,
      }),
      invalidatesTags: ['refereshToken'],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: 'POST',
      }),
      invalidatesTags: ['logout'],
    }),
    
    // Oauth APIs
    googleSignIn: builder.mutation<AuthResponseType, GoogleAuthProps>({
      query: (body) => ({
        url: "/auth/oauth/google",
        method: "POST",
        body,
      }),
      invalidatesTags: ["google"],
    }),
    appleSignIn: builder.mutation<AuthResponseType, AppleAuthProps>({
      query: (body) => ({
        url: "/auth/oauth/apple",
        method: "POST",
        body,
      }),
      invalidatesTags: ["apple"],
    }),

    // OTP APIs
    sendNewUserOTP: builder.mutation<any, OTPEmailProp>({
      query: (body) => ({
        url: "/auth/otp/signup/send",
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ['resendNewUserOTP'],
    }),
    verifyNewUserOTP: builder.mutation<AuthResponseType, VerifyOTPProps>({
      query: (body) => ({
        url: "/auth/otp/signup/verify",
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ["verifyNewUserOTP"],
    }),
    sendForgotPasswordOTP: builder.mutation<any, OTPEmailProp>({
      query: (body) => ({
        url: '/auth/otp/password/send',
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ['resendForgotPasswordOTP'],
    }),
    verifyForgotPasswordOTP: builder.mutation<any, VerifyOTPProps>({
      query: (body) => ({
        url: "/auth/otp/password/verify",
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ['verifyForgotPasswordOTP'],
    }),
    sendAcccountDeleteOTP: builder.mutation<any, void>({
      query: (body) => ({
        url: "/auth/otp/delete/send",
        method: 'POST',
        body,
      }),
      invalidatesTags: ['resendDeleteAccountOTP'],
    }),
    verifyAccountDeleteOTP: builder.mutation<any, VerifyOTPProps>({
      query: (body) => ({
        url: "/auth/otp/delete/verify",
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ['verifyDeleteAccountOTP'],
    }),

    // Password APIs
    forgotPassword: builder.mutation<any, {email: string}>({
      query: (body) => ({
        url: "/auth/password/forgot",
        method: 'POST',
        body: {
          ...body,
          appSlug,
        },
      }),
      invalidatesTags: ['forgotPassword'],
    }),
    resetPassword: builder.mutation<any, ResetPasswordProps>({
      query: (body) => ({
        url: '/auth/password/reset',
        method: 'POST',
        body: {
          email: body.email,
          newPassword: body.newPassword,
          appSlug,
        },
        headers: body.resetToken ? {
          'Authorization': `Bearer ${body.resetToken}`
        } : {},
      }),
      invalidatesTags: ['resetPassword'],
    }),
    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordProps>({
      query: (body) => ({
        url: "/auth/password/update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["updatePassword"],
    }),

    // Delete Account API
    deleteAccount: builder.mutation<any, void | DeleteAccountProps>({
      query: (body) => ({
        url: '/auth/account',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['deleteAccount'],
    }),

    //User Profile
    updateUserProfile: builder.mutation<any, FormData>({
      query: (body) => ({
        url: `/users/profile`,
        method: 'PATCH',
        body,
        prepareHeaders: (headers: Headers) => {
          headers.delete("Content-Type");
          return headers;
        },
      }),
      invalidatesTags: ['updateUserProfile'],
    }),

    getUserProfile: builder.query<UserProfileProps, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['getUserProfile']
    })
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGoogleSignInMutation,
  useAppleSignInMutation,
  useUpdatePasswordMutation,
  useVerifyNewUserOTPMutation,
  useVerifyForgotPasswordOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useDeleteAccountMutation,
  useSendAcccountDeleteOTPMutation,
  useSendForgotPasswordOTPMutation,
  useSendNewUserOTPMutation,
  useVerifyAccountDeleteOTPMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = authApi;
