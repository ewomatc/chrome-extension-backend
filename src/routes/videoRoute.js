const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getVideo, uploadVideo } = require('../controllers/videoController')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('video/')){
        cb(null, true)
    }else{
        cb(new Error('File type not supported'), false);
    }
}

const upload = multer({ storage, fileFilter});

const router = express.Router();

// Directory where your uploaded videos are stored
const videoDirectory = 'uploads/'; 

// Route to get a list of all video files
router.get('/api/videos', (req, res) => {
    try {
        // Read the contents of the video directory
        fs.readdir(videoDirectory, (err, files) => {
            if (err) {
                console.error('Error reading video directory:', err);
                return res.status(500).json({ error: 'An error occurred while fetching videos' });
            }

            // Filter out non-video files (adjust as needed based on file types)
            const videoFiles = files.filter((file) => {
                const fileExtension = path.extname(file).toLowerCase();
                return ['.mp4', '.avi', '.mkv'].includes(fileExtension); 
            });

            // Construct an array of video URLs
            const videoUrls = videoFiles.map((file) => {
                return `${req.protocol}://${req.get('host')}/uploads/videos/${file}`;
            });

            return res.status(200).json({ success: true, videos: videoUrls });
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return res.status(500).json({ error: 'some error occurred while fetching videos' });
    }
});


router.get('/api/video/:filename', getVideo);

router.post('/api/upload',upload.single('video'), uploadVideo);

module.exports = router;
