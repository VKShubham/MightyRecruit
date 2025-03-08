import apiClient from "@/util/apiClient";
import { AxiosResponse } from "axios";

const BASE_URL = "/candidate";

// Get Candidate Details
export const getCandidateDetails = async(candidate_id: string) : Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/${candidate_id}`);
    } catch (error) {
        throw error
    }
}

// Get Candidate Details
export const getProfileDetails = async() : Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/profile`);
    } catch (error) {
        throw error
    }
}

export const registerCandidate = async (formData: FormData): Promise<AxiosResponse> => {
    try {
        return await apiClient.post(`${BASE_URL}/register`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    } catch (error) {
        throw error;
    }
};

export const isCandidate = async (): Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/exist`);
    } catch (error) {
        throw error;
    }
};
