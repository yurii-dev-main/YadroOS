import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret',
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'yadro-os-storage';

export const s3Service = {
  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const fileKey = `${uuidv4()}-${originalName}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    
    await s3Client.send(command);
    return fileKey;
  },

  async getPresignedUrl(fileKey: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }
};
