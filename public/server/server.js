// streamsave-server/server.js (v4.0 - Final)
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get('/get-video-info', async (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
  }
  try {
    const info = await ytdl.getInfo(url);
    const uniqueFormats = {};

    // Get all formats with video or audio
    info.formats.forEach(format => {
      // Create a definitive quality label, falling back to resolution or bitrate
      let quality = format.qualityLabel;
      if (!quality && format.height) quality = `${format.height}p`;
      if (!quality && format.audioBitrate) quality = `${format.audioBitrate}kbps`;

      if (quality) {
        // Prefer formats with both audio and video if available for a given quality
        if (!uniqueFormats[quality] || (format.hasVideo && format.hasAudio && !uniqueFormats[quality].hasAudio)) {
            uniqueFormats[quality] = format;
        }
      }
    });
    
    // Convert map to a sorted array
    const sortedFormats = Object.values(uniqueFormats)
        .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));

    res.json({
      success: true,
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: sortedFormats.map(f => ({ 
          itag: f.itag, 
          qualityLabel: f.qualityLabel || `${f.height}p` || `${f.audioBitrate}kbps`, 
          container: f.container || 'mp3', 
          contentLength: f.contentLength,
          url: f.url 
        })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`StreamSave Pro server (v4.0) running on port ${PORT}`);
});