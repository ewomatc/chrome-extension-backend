const express = require('express');
const videoRoutes = require('./src/routes/videoRoute')
const {notFound, errorHandler} = require('./src/middleware/errorhandler')
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());
// Serve uploaded video files
app.use('/uploads/videos', express.static('uploads/videos'));

app.use(videoRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the api ',
    usage: {
      1:'access "/api/videos" to get all videos.',
      2: '"api/upload" to upload a new video', 
      3: '"/api/video/examplevideourl.mp4" to get a video'
    }
  })
})

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
