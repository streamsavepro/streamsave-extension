// Minimal YouTube processor for offscreen document
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target !== 'offscreen') return;

  if (msg.type === 'process-youtube') {
    try {
      const url = new URL(msg.url || msg.videoUrl);
      const videoId = url.searchParams.get('v');
      
      if (!videoId) {
        chrome.runtime.sendMessage({
          type: 'youtube-error',
          error: 'Invalid YouTube URL: No video ID found'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending YouTube error:', chrome.runtime.lastError.message);
          }
        });
        return;
      }
      
      // In a real implementation, you'd use ytdl-core or similar
      // This is a mock direct link for demonstration
      chrome.runtime.sendMessage({
        type: 'youtube-processed',
        data: {
          directUrl: `https://youtube.com/v/${videoId}`,
          filename: `youtube_${videoId}.mp4`
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending YouTube processed:', chrome.runtime.lastError.message);
        }
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'youtube-error',
        error: error.message
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending YouTube error:', chrome.runtime.lastError.message);
        }
      });
    }
  }
});
