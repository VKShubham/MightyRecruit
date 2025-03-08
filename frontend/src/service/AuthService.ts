import apiClient from '@/util/apiClient';
import { AxiosResponse } from 'axios';

const BASE_URL = '/user';

interface credentials {
    userid: string;
    password: string;
}
export const login = async(credentials: credentials): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/login`, credentials);
        return response;
    } catch (error) {
        throw error
    }
}
export const logout = async() : Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/logout`);
        return response;
    } catch (error) {
        throw error
    }
}

// Singup Candidate
export const signupCandidate = async (obj: {
    username: string;
    email: string;
    password: string;
}): Promise<AxiosResponse> => {
    try {
        return await apiClient.post(`${BASE_URL}/signup`, obj);
    } catch (error) {
        throw error;
    }
};