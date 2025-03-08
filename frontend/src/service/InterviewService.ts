import { Interview_result, InterviewData, UpdateInterviewData } from "@/@types/interview";
import apiClient from "@/util/apiClient";
import axios, { AxiosResponse } from "axios";

const BASE_URL = '/interview';

export const createInterview = async(obj: InterviewData): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/create`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getInterviewDetails = async(id: string): Promise<AxiosResponse> =>  {
    try {
        const response = await axios.get(`http://localhost:3000${BASE_URL}/${id}`, {withCredentials: true});
        return response;
    } catch (error) {
        throw error;
    }
}

export const deleteInterview = async(id: string): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getInterviewRelatedDetails = async(id: string): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/related/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getHRInterviews = async(arr: any): Promise<AxiosResponse> =>  {
    try {
        const queryParams = new URLSearchParams(arr).toString();
        const response = await apiClient.get(`${BASE_URL}/interviews/hr?${queryParams}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const setInterviewFeedback = async(obj: {application_id: string,interview_id: string,feedbackData: { notes: string},selection_pipeline_id: string;
}): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.patch(`${BASE_URL}/feedback`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const updateInterview = async(action: string, obj: UpdateInterviewData): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/${action}`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const cancelInterview = async(obj: UpdateInterviewData): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/cancelInterview`,obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const updateResult = async(obj: {interview_id: string, result: Interview_result}): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/result`,obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getUpcomingInteviews = async(): Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/upcomingInterview`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getAdvanceFilterInfo2 = async ():Promise<AxiosResponse> => {
    try {
        const response = await apiClient.get(`${BASE_URL}/filter`);
        return response;
    } catch (error) {
       throw error
    }
}