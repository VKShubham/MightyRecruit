import apiClient from "@/util/apiClient";
import { AxiosResponse } from "axios";

const BASE_URL = 'http://localhost:3000/interviewer';

export const getAllInterviewers = async(): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const createInterviewer = async(email: string, username: string): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/create`, {email, username} );
        return response;
    } catch (error) {
        throw error;
    }
}

export const getAvailableInterviewer = async(time: string): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/available/${time}`);
        return response;
    } catch (error) {
        throw error;
    }
}
