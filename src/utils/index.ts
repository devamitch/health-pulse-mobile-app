import { Vibration } from 'react-native';
import RNFS from 'react-native-fs';
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

export const saveFileToAppMemory = async (
  uri: string,
  type: string,
  name: string,
): Promise<string> => {
  try {
    // Define destination path
    let destPath = `${RNFS.DocumentDirectoryPath}/${name}`;

    // Check if a file with the same name already exists
    const fileExists = await RNFS.exists(destPath);

    if (fileExists) {
      // Generate a new file name if the file already exists
      const timestamp = new Date().getTime();
      const extension = name.split('.').pop();
      const baseName = name.replace(`.${extension}`, '');
      const newName = `${baseName}_${timestamp}.${extension}`;
      destPath = `${RNFS.DocumentDirectoryPath}/${newName}`;
    }
    // Copy file to the destination path
    await RNFS.copyFile(uri, destPath);

    // Return the saved file path
    return destPath;
  } catch (error) {
    throw new Error(`Failed to save file: ${error}`);
  }
};

export const haptic = async (haptic_level = 0) => {
  try {
    if (haptic_level !== 0) Vibration.vibrate(haptic_level);
  } catch (err) {
    console.error(err);
  }
};

export const hapticFeedback = (
  type: keyof typeof HapticFeedbackTypes,
): void => {
  trigger(type, {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  });
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
