import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { s3Service } from '../services/s3.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileKey = await s3Service.uploadFile(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype
    );
    
    const url = await s3Service.getPresignedUrl(fileKey);
    
    res.json({ fileKey, url });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
