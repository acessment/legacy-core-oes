import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import config from "@/config/config.server";
// Note: institutionId parameter is included for future multi-tenancy support
// Currently not used but can be extended for institution-specific buckets

/**
 * Get S3 client instance
 * @returns Configured S3Client
 */
const getS3Client = () => {
    
    return new S3Client({
        credentials: {
            accessKeyId: config.awsS3AccessKeyId || "",
            secretAccessKey: config.awsS3SecretKey || "",
        },
        region: config.awsS3Region || "us-east-1",
    });
};

/**
 * Get a file from S3
 * @param key - S3 file key
 * @param institutionId - Institution identifier (for future multi-tenancy)
 * @returns The file as a buffer
 */
export const getFile = async (key: string, institutionId?: string): Promise<Buffer | null> => {
    try {
        const s3Client = getS3Client();
        
        const command = new GetObjectCommand({
            Bucket: config.awsS3BucketName || "",
            Key: key,
        });

        const response = await s3Client.send(command);
        if (!response.Body) {
            return null;
        }
        return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
        console.error("Error getting file from S3:", error);
        return null;
    }
};

// /**
//  * Get a presigned URL for a file in S3
//  * @param key - S3 file key
//  * @param institutionId - Institution identifier (for future multi-tenancy)
//  * @param expiresIn - Time in seconds until URL expires (default: 3600)
//  * @returns Presigned URL
//  */
// export const getFileUrl = async (key: string, institutionId?: string, expiresIn: number = 3600): Promise<string> => {
//     try {
//         const s3Client = getS3Client();
//         const config = getServerConfigFromEnv();
        
//         const command = new GetObjectCommand({
//             Bucket: config.awsS3BucketName || "",
//             Key: key,
//         });

//         const url = await getSignedUrl(s3Client, command, { expiresIn });
//         return url;
//     } catch (error) {
//         console.error("Error generating presigned URL:", error);
//         throw error;
//     }
// };

/**
 * Upload a file to S3
 * @param key - S3 file key
 * @param body - File content
 * @param contentType - File MIME type
 * @returns Success status
 */
export const uploadFile = async (
    key: string,
    body: Buffer,
    contentType: string,
): Promise<boolean> => {
    try {
        const s3Client = getS3Client();
        
        const command = new PutObjectCommand({
            Bucket: config.awsS3BucketName || "",
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        return false;
    }
};

/**
 * Delete a file from S3
 * @param key - S3 file key
 * @param institutionId - Institution identifier (for future multi-tenancy)
 * @returns Success status
 */
export const deleteFile = async (key: string, institutionId?: string): Promise<boolean> => {
    try {
        const s3Client = getS3Client();
        
        const command = new DeleteObjectCommand({
            Bucket: config.awsS3BucketName || "",
            Key: key,
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        return false;
    }
};

/**
 * Upload a base64 encoded file to S3
 * @param base64Data - Base64 encoded data (without data URI prefix)
 * @param key - S3 file key
 * @param institutionId - Institution identifier (for future multi-tenancy)
 * @returns Success status
 */
export const uploadBase64 = async (base64Data: string, key: string, institutionId?: string): Promise<boolean> => {
    try {
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, "base64");

        // Determine content type based on file extension
        let contentType = "application/octet-stream";
        if (key.endsWith(".png")) {
            contentType = "image/png";
        } else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (key.endsWith(".mp3")) {
            contentType = "audio/mpeg";
        } else if (key.endsWith(".pdf")) {
            contentType = "application/pdf";
        }

        // Upload to S3
        return await uploadFile(key, buffer, contentType);
    } catch (error) {
        console.error("Error uploading base64 to S3:", error);
        return false;
    }
};

export const s3Service = {
    getFile,
    uploadFile,
    deleteFile,
    uploadBase64,
};
