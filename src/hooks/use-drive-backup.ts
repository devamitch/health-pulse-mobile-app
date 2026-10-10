import { useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";
import RNFS from "react-native-fs";
import { useAppSelector } from "@/services/mmkv-redux/hooks";
import firestore from "@react-native-firebase/firestore";

interface UploadOptions {
  fileName: string;
  mimeType: string;
  base64?: string;
  filePath?: string;
}

export function useGoogleDriveBackup() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { userData } = useAppSelector(state => state.user);

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.file"],
      webClientId: "806922605148-lvhs3rf1aso3ar2eim8f9nptcg3ukmiu.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: false,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      setAccessToken(tokens.accessToken);
      return tokens.accessToken;
    } catch (error) {
      console.log("Google Sign-In error", error);
      throw error;
    }
  };

  const getToken = async () => {
    if (accessToken) return accessToken;

    const tokens = await GoogleSignin.getTokens();
    setAccessToken(tokens.accessToken);
    return tokens.accessToken;
  };

  const uploadFile = async ({ fileName, mimeType, base64, filePath }: UploadOptions) => {
    try {
      let token: string;

      try {
        token = await getToken();
      } catch (error) {
        await signIn();
        token = await getToken();
      }

      let fileBase64 = base64;

      if (!fileBase64 && filePath) {
        fileBase64 = await RNFS.readFile(filePath, "base64");
      }

      if (!fileBase64) throw new Error("No file data provided");

      const metadata = { name: fileName, mimeType };

      const form = new FormData();
      form.append(
        "metadata",
        {
          string: JSON.stringify(metadata),
          type: "application/json",
        } as any
      );

      form.append(
        "file",
        {
          uri: `data:${mimeType};base64,${fileBase64}`,
          name: fileName,
          type: mimeType,
        } as any
      );

      const response = await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await firestore()
        .collection('users')
        .doc(userData?.uid)
        .set(
          {  backupFileID: response.data.id },
          { merge: true }
        );


      return response.data.id;
    } catch (error) {
      console.error("Upload error", error);
      throw error;
    }
  };

  const downloadFile = async () => {
    try {
      let token: string;
      let fileId: string;

      try {
        token = await getToken();
      } catch (error) {
        await signIn();
        token = await getToken();
      }
      
      const doc = await firestore().collection('users').doc(userData?.uid).get();

      if (doc.exists()) {
        const data = doc.data();
        fileId = data?.backupFileID ?? '';
      } else {
        fileId = '';
      }

      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return Buffer.from(response.data, "binary").toString("base64");
    } catch (error) {
      console.error("Download error", error);
      throw error;
    }
  };

  return {
    signIn,
    uploadFile,
    downloadFile,
  };
}
