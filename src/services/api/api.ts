import axios from 'axios';
import { constant } from '../config';
import { navigationRef } from '../../../App';

export function navigate(name: string) {
    // @ts-ignore
    navigationRef.current?.navigate(name);
}

const axiosInstance = axios.create({
    baseURL: constant.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async config => {
        //do want you wont to do before call
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Relogin the user if the token expires
axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    async function (error: any) {
        if (error?.response?.data?.data === 'Token Expired') {
            navigate('LoginScreen');
            //do what you want to do in here
        } else {
            // Snackbar.show({
            //   text:
            //     error?.response?.data?.message ??
            //     'Somthing went wrong! Please try again.',
            // });
        }

        console.log(error.response);
        

        return Promise.reject(error.response);
    },
);

export { axiosInstance };
