import { Platform } from 'react-native';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import { unzipWithPassword, zipWithPassword } from 'react-native-zip-archive';
import { Toast } from '../../utils/toast';
import SQLite from 'react-native-sqlite-storage';

const closeDBs = async () => {
  const message = await SQLite.openDatabase({
    name: 'messages.db',
    location: 'default',
  });
  const vital = await SQLite.openDatabase({
    name: 'vitals.db',
    location: 'default',
  });

  await message.close();
  await vital.close();
}

export const restoreDB = async (
  encryptionKey: string,
  encryptedBase64: string
) => {
  try {
    await closeDBs();
    
    const zipPath = `${DocumentDirectoryPath}/HealthPulse.db.restore.zip`;
    const unzipPath = `${DocumentDirectoryPath}/HealthPulse_restore`;

    const dbTargetPath = Platform.select({
      ios: `${RNFS.LibraryDirectoryPath}/LocalDatabase`,
      android: `/data/data/com.devamitch.HealthPulse/databases`,
    });

    if (!dbTargetPath) {
      Toast("Unsupported platform");
      return false;
    }

    // Cleanup previous restore files
    if (await RNFS.exists(zipPath)) await RNFS.unlink(zipPath);
    if (await RNFS.exists(unzipPath)) await RNFS.unlink(unzipPath);

    // Save encrypted ZIP
    await RNFS.writeFile(zipPath, encryptedBase64, "base64");

    // Unzip — normalize return value for Android/iOS
    let extracted = await unzipWithPassword(zipPath, unzipPath, encryptionKey);

    const extractedFolder =
      typeof extracted === "string"
        ? extracted
        : extracted?.path ?? unzipPath;

    if (!extractedFolder || !(await RNFS.exists(extractedFolder))) {
      Toast("Restore failed: extracted folder missing");
      return false;
    }

    // SQLite files allowed to restore
    const allowedExtensions = [".db", ".db-wal", ".db-shm"];

    // Remove old DB
    if (await RNFS.exists(dbTargetPath)) {
      await RNFS.unlink(dbTargetPath);
    }

    // Recreate DB folder
    await RNFS.mkdir(dbTargetPath);

    // Read extracted folder
    const files = await RNFS.readDir(extractedFolder);

    for (const file of files) {
      if (file.isDirectory()) continue;

      const lower = file.name.toLowerCase();

      // Skip Firebase/Firestore/LevelDB cache files
      if (
        lower.includes("firestore") ||
        lower.includes("firebase") ||
        lower.includes("leveldb")
      ) {
        console.log("Skipping Firestore/Firebase file:", file.name);
        continue;
      }

      // Only restore SQLite database files
      const isSQLite = allowedExtensions.some(ext =>
        file.name.endsWith(ext)
      );

      if (!isSQLite) {
        console.log("Skipping non-db file:", file.name);
        continue;
      }

      const destPath = `${dbTargetPath}/${file.name}`;
      console.log("Restoring:", file.name);
      await RNFS.copyFile(file.path, destPath);
    }

    Toast("Database restored successfully.");
    return true;

  } catch (error) {
    console.error("Error restoring database:", error);
    Toast("Error restoring backup.");
    return false;
  }
};

export const backupDB = async (
  encryptionKey: string,
) => {
  const sourcePath = Platform.select({
    ios: `${RNFS.LibraryDirectoryPath}/LocalDatabase`,
    android: `/data/data/com.devamitch.HealthPulse/databases`,
  });

  if (!sourcePath) {
    Toast('Unsupported platform.');
    return false;
  }

  const backupFilePath = `${DocumentDirectoryPath}/HealthPulse.db.backup.zip`;

  try {
    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      console.log(`DB not found at path: ${sourcePath}`);
      Toast(`Database not found in the specified path.`);
      return false;
    }

    const zipPath = await zipWithPassword(
      sourcePath,
      backupFilePath,
      encryptionKey,
    );
    
    return zipPath;
  } catch (error) {
    console.error('Error backing up database:', error);
    console.error('Source path:', sourcePath);
    console.error('Backup path:', backupFilePath);
    Toast(`Error backing up database`);
    return false;
  }
};
