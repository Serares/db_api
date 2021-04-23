import axios from 'axios';
import { GCS_MIDDLEWARE_URL } from '../utils/secrets';

export const gcsRequest = axios.create({
    baseURL: GCS_MIDDLEWARE_URL
});

export const gcsRemoveSubmitedImages = (subfolderId: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await gcsRequest.post(`storage/deleteUserSubmitedImages/${subfolderId}`);
            resolve(response);
        } catch (err) {
            reject(err);
        }
    })


}