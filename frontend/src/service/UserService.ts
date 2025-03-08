import { ChangePassword, CreateCrendetail } from "@/schema";
import apiClient from "@/util/apiClient";
import { AxiosResponse } from "axios";

const BASE_URL = "/user";

// Get User Information
export const getUser = async (): Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/user`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch user data");
    }
};

// Register Candidate
export const registerCandidate = async (formData: FormData): Promise<AxiosResponse> => {
    try {
        return await apiClient.post(`${BASE_URL}/register`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Candidate registration failed");
    }
};

// Get Candidate Details
export const getCandidateDetails = async(candidate_id: string) : Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/${candidate_id}`);
    } catch (error) {
        throw error;
    }
}

// Forget Passwword
export const forgetPassword = async(data: { email: string }) : Promise<AxiosResponse> => {
    try {
        return await apiClient.patch(`${BASE_URL}/forget-password`, data);
    } catch (error) {
        throw error;
    }
}

// Create Candidate
export const createCandidate = async(data: CreateCrendetail) : Promise<AxiosResponse> => {
    try {
        return await apiClient.post(`${BASE_URL}/candidate`, data);
    } catch (error) {
        throw error;
    }
}

// Check Username
export const checkusername = async(data: string) : Promise<AxiosResponse> => {
    try {
        return await apiClient.get(`${BASE_URL}/checkusername?username=${data}`);
    } catch (error) {
        throw error;
    }
}
// Check Username
export const changePassword = async(data: ChangePassword) : Promise<AxiosResponse> => {
    try {
        return await apiClient.patch(`${BASE_URL}/password`, data);
    } catch (error) {
        throw error;
    }
}
