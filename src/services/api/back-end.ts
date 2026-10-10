import { BACK_END } from '@env';
import axios from 'axios';
import { 
    MediaData as CDNResponseProps,
    NotificationData as NotificationResponseProps,
} from './../mmkv-redux/slices/interfaces';

export interface CDNRequestProps {
    id: string;
}

export interface NotificationRequestByIDProps {
    id: string;
}

export interface NotificationRequestByUserProps{
    userId: string;
}

export type PatchNotificationProps = Partial<
            Omit<NotificationResponseProps, 'userId' | 'status' | 'sentAt' | 'createdAt' | 'updatedAt' | '__v' | '_id'>
        > & {_id: string}

const backend = axios.create({
    baseURL: BACK_END,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const CDNService = {
    getFile : async (params?: CDNRequestProps): Promise<CDNResponseProps[]> => {
        const url = `/stored-files${params !== undefined ? `/${params.id}` : ''}`;
        const response = await backend.get(url);
        return response.data;
    },
};

export const NotificationService = {
    setNotification: async (params: Omit<NotificationResponseProps, '_id' | 'status' | 'sentAt' | 'createdAt' | 'updatedAt' | '__v'>): Promise<boolean> => {
        const response = await backend.post('/notification-schedules', params);
        if(response.status === 201)
            return true;
        return false;
    },
    getNotificationByID: async (params: NotificationRequestByIDProps): Promise<NotificationResponseProps> => {
        const response = await backend.get(`/notification-schedules/${params.id}`);
        return response.data;
    },
    deleteNotificationByID: async (params: NotificationRequestByIDProps): Promise<NotificationResponseProps> => {
        const response = await backend.delete(`/notification-schedules/${params.id}`);
        return response.data;
    },
    patchNotificationByID: async (params: PatchNotificationProps): Promise<NotificationResponseProps> => {
        const response = await backend.patch(`/notification-schedules/${params._id}`);
        return response.data;
    },
    getNotificationByUser: async (params: NotificationRequestByUserProps): Promise<NotificationResponseProps[]> => {
        const response = await backend.get(`/notification-schedules/user/${params.userId}`);
        return response.data;
    },
};
