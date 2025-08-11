// services/uploadService.js

import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload a buffer to Cloudinary in chunks (with progress logging).
 *
 * @param {Buffer} buffer - The file buffer
 * @param {string} filename - The name for the uploaded file
 * @returns {Promise<Object>} - The result from Cloudinary
 */
export const uploadStream = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', public_id: `uploads/${filename}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const chunkSize = 1024 * 100; // 100KB
    const totalChunks = Math.ceil(buffer.length / chunkSize);
    let uploadedChunks = 0;

    console.log('🔁 Starting upload in chunks...\n');

    // Create a custom Readable stream to push chunks
    const readable = new Readable({
      read() {
        if (uploadedChunks >= totalChunks) {
          this.push(null); // end the stream
        } else {
          const start = uploadedChunks * chunkSize;
          const end = start + chunkSize;
          const chunk = buffer.slice(start, end);
          this.push(chunk);

          uploadedChunks++;
          const percent = Math.floor((uploadedChunks / totalChunks) * 100);
          process.stdout.write(`\r📦 Upload Progress: ${percent}%`);
        }
      }
    });

    // Pipe the custom stream to Cloudinary
    readable.pipe(stream);
  });
};
