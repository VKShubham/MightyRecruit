import { CreateBadge } from '@/schema';
import apiClient from '@/util/apiClient';
import { AxiosResponse } from 'axios';

const BASE_URL = '/badge';

interface UpdateBadge extends CreateBadge {
    id: string;
}

export const createBadge = async(obj: CreateBadge): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const UpdateBadge = async(obj: UpdateBadge): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.patch(`${BASE_URL}/`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getAllbadges = async(): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const AttachBadge = async(obj: {
    application_id: string;
    badge_ids: string[];
}): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.post(`${BASE_URL}/attach`, obj);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getApplicationBadges = async( application_id: string ): Promise<AxiosResponse> =>  {
    try {
        const response = await apiClient.get(`${BASE_URL}/${application_id}`);
        return response;
    } catch (error) {
        throw error;
    }
}
