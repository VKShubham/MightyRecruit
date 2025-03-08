import { EditJobType } from '@/components/JobEdit/JobEdit';
import apiClient from '@/util/apiClient';
import { AxiosResponse } from 'axios';

const BASE_URL = '/job';


 export const createJob = async(data: any): Promise<AxiosResponse> =>  {
        try {
            const response = await apiClient.post(`${BASE_URL}/create`, data);
            return response;
        } catch (error) {
            throw error;
        }
}

export const getJobs = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/open`);
        return response;
    } catch (error) {
         throw error;
    }
}

export const getAllJobs = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/all`);
        return response;
    } catch (error) {
         throw error;
    }
}

export const getJobStats = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/stats`);
        return response;
    } catch (error) {
         throw error
    }
}

export const getRecentJobs = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/recentjobs`);
        return response;
    } catch (error) {
         throw error
    }
}

export const GetJobById = async(job_id: string): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${job_id}`);
        return response;
    } catch (error) {
         throw error
    }
}

export const UpdateJob = async(obj: EditJobType): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/update`, obj);
        return response;
    } catch (error) {
         throw error
    }
}