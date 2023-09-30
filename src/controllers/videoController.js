const path = require('path');
const fs = require('fs');
const videoDirectory = path.join(__dirname, '../../uploads/');

exports.getVideo = (req, res, next) => {
    const filename = req.params.filename;
    const videoPath = path.join(videoDirectory, filename);
    console.log(videoDirectory);
     // Check if the video file exists
     if (fs.existsSync(videoPath)) {
        // Use the 'video/mp4' MIME type for video files (adjust as needed)
        res.setHeader('Content-Type', 'video/mp4');
        //res.status(200).json({ success: true, video: videoPath})
        // Stream the video file to the response
        const videoStream = fs.createReadStream(videoPath);
        videoStream.pipe(res);
    } else {
        // Return a 404 error if the video file does not exist
        res.status(404).json({error: 'Video not found'});
    }

};

exports.uploadVideo = async (req, res, next) => {
    try {
        if (req.file) {
            // If there is a file in the request, it's a standard upload
            const videoPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            return res.status(200).json({ success: true, link: videoPath });
        }

        // If there's no file, it's a chunked upload

        // Check if it's a chunk upload or the finalization request
        if (req.body.finalize) {
            // Handle the request to finalize the upload
            // First, append any remaining chunk data
            const chunkData = req.body.chunkData; // Assuming there's a 'chunkData' field in your request
            if (chunkData) {
                fs.appendFile('tempVideo.mp4', chunkData, (err) => {
                    if (err) {
                        console.error('Error appending video chunk:', err);
                        return res.status(500).json({ error: 'Error uploading video chunk' });
                    }

                    // After appending, proceed to finalize by renaming
                    fs.rename('tempVideo.mp4', `uploads/${req.file.filename}`, (err) => {
                        if (err) {
                            console.error('Error finalizing video upload:', err);
                            return res.status(500).json({ error: 'Error finalizing video upload' });
                        } else {
                            const videoPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                            return res.status(200).json({ success: true, link: videoPath });
                        }
                    });
                });
            } else {
                // If there's no remaining chunk data, directly rename the file
                fs.rename('tempVideo.mp4', `uploads/${req.file.filename}`, (err) => {
                    if (err) {
                        console.error('Error finalizing video upload:', err);
                        return res.status(500).json({ error: 'Error finalizing video upload' });
                    } else {
                        const videoPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                        return res.status(200).json({ success: true, link: videoPath });
                    }
                });
            }
        } else {
            // Handle individual video chunk uploads
            const chunkData = req.body.chunkData; // Assuming you have a 'chunkData' field in your request
            fs.appendFile('tempVideo.mp4', chunkData, (err) => {
                if (err) {
                    console.error('Error appending video chunk:', err);
                    return res.status(500).json({ error: 'Error uploading video chunk' });
                } else {
                    return res.status(200).json({ success: true, message: 'Video chunk uploaded successfully' });
                }
            });
        }
    } catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ error: 'An error occurred while uploading' });
    }
};