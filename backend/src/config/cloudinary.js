import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'auto', // automatically detected which format is it
    use_filename: true, // saves uploaded file with original name
    unique_filename: true, // ensures unique filename
  },
});


const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'company_logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // here crop limit means shrink large images and do not enlarge shorter images. Used for balance and quality
  },
});

export const uploadResume = multer({ 
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are allowed.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadLogo = multer({ storage: logoStorage });


