import axios from 'axios';
import RNFS from 'react-native-fs';
import { updateUserInSupabase } from './auth/handle-user';
// import firestore from '@react-native-firebase/firestore';

const generatePresignedURL = async (url: string, id: string, fileName: string, fileType: string) => {
    const headers = { "Content-Type": "application/json" }
    const data = {id, fileName, fileType}

    const response = await axios.put(url, data, {headers})

    return response.data
}

export const backupChatFile = async (fileName: string, fileType: string, filePath: string, path: string, uid: string) : Promise<{success: boolean, fileName: string, data?: any, error?: any}> => {
    try{
        const inputUrl = 'https://he6qb6xke3.execute-api.ca-central-1.amazonaws.com/presignedurl'
        const generatedURL = await generatePresignedURL(inputUrl, path, fileName, fileType)
        const url = generatedURL.preSignedUrl

        const headers = { "Content-Type": "application/zip" }

        const fileData = await RNFS.readFile(filePath, 'base64')
        const bufferData = Buffer.from(fileData, 'base64')

        const response = await axios.put(url, bufferData, {headers, maxBodyLength: Infinity})

        if(response.status === 200) {
            await updateUserInSupabase(uid, {
                last_db_backup: {[path]: fileName},
            })
            // await firestore().collection('users').doc(uid).set(
            //     {lastBackup : {[path] : fileName}},
            //     {merge: true}
            // )
            return {success: true, fileName: fileName, data: response.data}
        }
        else
            return {success: false, fileName: fileName, data: response.data}
    } catch(error) {
        return {success: false, fileName: fileName, error: error}
    }
}

export const restoreChatFile = async (filePath: string, fileName: string) => {
    try {
        const url = 'https://he6qb6xke3.execute-api.ca-central-1.amazonaws.com/object'
        const preSignedUrl = await axios.patch(url, {id: filePath, fileName: fileName}, {headers: {"Content-Type": "application/json"}})
        return {success: true, preSignedUrl: preSignedUrl.data?.preSignedUrl}
    } catch (error) {
        console.error(error)
        return {success: false, error: error}
    }
}
