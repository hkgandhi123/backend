import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';


cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = multer.memoryStorage();
export const upload = multer({ storage });


export async function uploadToCloudinary(buffer){
return new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream({ folder: 'insta-mern' }, (err, result) => {
if (err) return reject(err);
resolve(result);
});
streamifier.createReadStream(buffer).pipe(stream);
});
}