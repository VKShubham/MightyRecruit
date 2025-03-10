import { Application_status } from "@/@types/application";
import apiClient from "@/util/apiClient";
import { AxiosResponse } from "axios";

const BASE_URL = '/application';

export const CreateApplication = async(jobid: string): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/create`, {Jobid: jobid});
        return response;
    } catch (error) {
        throw error;
    }
}

export const getUserApplications = async(): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/user`);
        return response;
    } catch (error) {
       throw error
    }
}

export const getPendingApplications = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/pending`)
        return response;
    } catch (error) {
        throw error
    }
}

export const getApprovedApplications = async(arr: any): Promise<AxiosResponse> => {
    try {
        const queryParams = new URLSearchParams(arr).toString();
        const response = await apiClient.get(`${BASE_URL}/approved?${queryParams}`)
        return response;
    } catch (error) {
        throw error
    }
}

export const changeApplicationStatus = async (application_id: string, status: Application_status, notes: string):Promise<AxiosResponse> => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/status`, {application_id, status, notes});
        return response;
    } catch (error) {
       throw error;
    }
}

export const getApplicationDetails = async (application_id: string):Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${application_id}`);
        return response;
    } catch (error) {
       throw error
    }
}

export const getNextStageDetails = async (application_id: string):Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/nextStage/${application_id}`);
        return response;
    } catch (error) {
       throw error
    }
}

export const getHiringTrends = async ():Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/hiringTrends`);
        return response;
    } catch (error) {
       throw error
    }
}

export const getAdvanceFilterInfo = async ():Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/filter`);
        return response;
    } catch (error) {
       throw error
    }
}