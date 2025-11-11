import lighthouse from '@lighthouse-web3/sdk';
import { LIGHTHOUSE_API_KEY } from '../config/lighthouse.js';

/**
 * Upload complaint data to Lighthouse IPFS
 * @param {Object} complaintData - The complaint data to upload
 * @param {Object} userData - The user data who filed the complaint
 * @returns {Promise<string>} - The CID of the uploaded data
 */
export async function uploadToLighthouse(complaintData, userData) {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured');
        }

        // Create a comprehensive complaint record with user info
        const complaintRecord = {
            complaint: {
                complaint_id: complaintData.complaint_id,
                category: complaintData.category,
                title: complaintData.title,
                description: complaintData.description,
                room_no: complaintData.room_no,
                floor: complaintData.floor,
                block: complaintData.block,
                image_url: complaintData.image_url,
                status: complaintData.status,
                created_at: complaintData.created_at,
            },
            filed_by: {
                user_id: userData.user_id,
                name: userData.name,
                email: userData.email,
                room_no: userData.room_no,
                hostel_block: userData.hostel_block,
            },
            metadata: {
                timestamp: new Date().toISOString(),
                platform: 'Hostel Complaint Portal',
                version: '1.0',
            }
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(complaintRecord, null, 2);

        // Upload text to Lighthouse
        const response = await lighthouse.uploadText(jsonString, LIGHTHOUSE_API_KEY);

        // The response contains the CID in response.data.Hash
        const cid = response.data.Hash;

        console.log('Successfully uploaded to Lighthouse. CID:', cid);
        return cid;

    } catch (error) {
        console.error('Error uploading to Lighthouse:', error);
        throw new Error('Failed to upload to Lighthouse: ' + error.message);
    }
}

/**
 * Get the public URL for accessing Lighthouse content
 * @param {string} cid - The CID of the content
 * @returns {string} - The public gateway URL
 */
export function getLighthouseUrl(cid) {
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

