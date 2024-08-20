require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const mime = require('mime-types');
const fs = require('fs');
const sharp = require('sharp');

const admin = require("firebase-admin");

const bucket = admin.storage().bucket();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "/files"); // Adjust the path as needed
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = mime.extension(file.mimetype);
    const filename = `${timestamp}.${extension}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async(req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {    
    // Read the uploaded Excel file
    const file = req.file;
    const destination = `uploads/${file.filename}`;
    
    const compressedFilePath = path.join(__dirname, 'files', `compressed-${file.filename}.jpg`);

    await sharp(file.path)
    .resize({ width: 800 }) 
    .jpeg({ quality: 80 })  // Compress to JPEG with 80% quality
    .toFile(compressedFilePath);
    // Upload the file to Firebase Storage
    await bucket.upload(compressedFilePath, {
      destination,
      metadata: {
        contentType: 'image/jpg',
      }
    });
    
    // Make the file public
    const fileInBucket = bucket.file(destination);
    await fileInBucket.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    res.json({ image: publicUrl });
    // Delete the file after sending the response
    fs.unlink(file.path, (err) => {
    });
    fs.unlink(compressedFilePath, (err) => {
    });
  } catch (error) {
    res.status(400).json({message:'Error in uploading. Try again later.',error});
  }
});


module.exports = router; 
