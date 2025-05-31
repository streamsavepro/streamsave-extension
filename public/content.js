console.log('StreamSave Pro content script loaded on:', window.location.href);
console.log('Page title:', document.title);
console.log('Is YouTube:', window.location.hostname.includes('youtube.com'));

// Check if on YouTube
function isYouTube() {
  return window.location.hostname.includes('youtube.com');
}

// Get video title
function getVideoTitle(videoElement, index) {
  if (videoElement.getAttribute('aria-label')) return videoElement.getAttribute('aria-label');
  if (videoElement.getAttribute('title')) return videoElement.getAttribute('title');
  if (document.title) return document.title;
  return `Video ${index + 1}`;
}

// Format duration
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'Unknown';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Capture thumbnail
function captureThumbnail(video) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  } catch (e) {
    return 'assets/placeholder.png';
  }
}

// Get YouTube video data
function getYouTubeVideoData() {
  try {
    console.log('Attempting YouTube video detection...');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    // Extract video ID from URL - handle both watch and shorts URLs
    let videoId = null;
    
    if (window.location.pathname.includes('/watch')) {
      const urlParams = new URLSearchParams(window.location.search);
      videoId = urlParams.get('v');
      console.log('Video ID from watch URL:', videoId);
    } else if (window.location.pathname.includes('/shorts/')) {
      videoId = window.location.pathname.split('/shorts/')[1]?.split('?')[0];
      console.log('Video ID from shorts URL:', videoId);
    }
    
    if (!videoId) {
      console.log('No video ID found in URL');
      return null;
    }
    
    // Get title from page
    let title = document.title;
    console.log('Default title:', title);
    
    // Try multiple selectors for title
    const titleSelectors = [
      'h1.ytd-watch-metadata yt-formatted-string',
      'h1.style-scope.ytd-watch-metadata',
      'h1[role="heading"]',
      '.ytd-watch-metadata h1',
      'meta[property="og:title"]',
      'meta[name="title"]'
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found title element with selector ${selector}:`, element);
        if (element.tagName === 'META') {
          const metaTitle = element.getAttribute('content');
          if (metaTitle && metaTitle !== title) {
            title = metaTitle;
            console.log('Using meta title:', title);
            break;
          }
        } else {
          const textTitle = element.textContent?.trim();
          if (textTitle && textTitle !== title && textTitle !== document.title) {
            title = textTitle;
            console.log('Using text title:', title);
            break;
          }
        }
      }
    }
    
    // Get duration from video element or page data
    let duration = 'Unknown';
    const videoElement = document.querySelector('video');
    console.log('Video element found:', !!videoElement);
    
    if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
      duration = formatDuration(videoElement.duration);
      console.log('Duration from video element:', duration);
    } else {
      // Try multiple selectors for duration
      const durationSelectors = [
        '.ytp-time-duration',
        '.ytd-thumbnail-overlay-time-status-renderer',
        'span.style-scope.ytd-thumbnail-overlay-time-status-renderer',
        '.ytd-watch-flexy .ytp-time-duration'
      ];
      
      for (const selector of durationSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          duration = element.textContent.trim();
          console.log(`Duration from selector ${selector}:`, duration);
          break;
        }
      }
    }
    
    const videoData = {
      id: `youtube_${videoId}`,
      title: title.replace(' - YouTube', '').trim(),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      duration: duration,
      quality: '720p',
      quality_options: ['1080p', '720p', '480p', '360p', '240p'],
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
    };
    
    console.log('YouTube video data created:', videoData);
    return videoData;
  } catch (e) {
    console.error('YouTube detection error', e);
    return null;
  }
}

// Main detection function
function detectVideos() {
  console.log('Starting video detection...');
  const videos = [];
  
  // Detect YouTube videos first
  if (isYouTube()) {
    console.log('Detecting YouTube video...');
    const ytVideo = getYouTubeVideoData();
    if (ytVideo) {
      videos.push(ytVideo);
      console.log('YouTube video detected:', ytVideo);
    } else {
      console.log('No YouTube video found');
    }
  }
  
  // Detect standard video elements
  const videoElements = document.querySelectorAll('video');
  console.log('Found video elements:', videoElements.length);
  
  videoElements.forEach((video, index) => {
    console.log(`Processing video element ${index + 1}:`, video);
    
    // Skip if this is a YouTube video (already handled above)
    if (isYouTube()) {
      console.log('Skipping video element on YouTube (handled separately)');
      return;
    }
    
    let src = video.src || video.currentSrc;
    console.log('Video src:', src);
    
    // Try to get source from source elements
    if (!src) {
      const source = video.querySelector('source');
      if (source) {
        src = source.src;
        console.log('Found source element src:', src);
      }
    }
    
    // Skip if no valid source
    if (!src || src.startsWith('blob:') || src.startsWith('data:')) {
      console.log('Skipping video with invalid src:', src);
      return;
    }
    
    // Create video object
    const videoObj = {
      id: `video_${index}_${Date.now()}`,
      title: getVideoTitle(video, index),
      url: src,
      duration: formatDuration(video.duration),
      quality: video.videoHeight ? `${video.videoHeight}p` : '720p',
      quality_options: ['1080p', '720p', '480p', '360p'],
      thumbnail: captureThumbnail(video)
    };
    
    videos.push(videoObj);
    console.log('Standard video detected:', videoObj);
  });
  
  // Detect videos from common streaming sites
  detectStreamingVideos(videos);
  
  console.log(`Total videos detected: ${videos.length}`);
  return videos;
}

// Detect videos from streaming platforms
function detectStreamingVideos(videos) {
  const hostname = window.location.hostname.toLowerCase();
  
  // Vimeo detection
  if (hostname.includes('vimeo.com')) {
    const vimeoId = window.location.pathname.split('/').pop();
    if (vimeoId && /^\d+$/.test(vimeoId)) {
      videos.push({
        id: `vimeo_${vimeoId}`,
        title: document.title.replace(' on Vimeo', ''),
        url: window.location.href,
        duration: 'Unknown',
        quality: '720p',
        quality_options: ['1080p', '720p', '480p'],
        thumbnail: `https://vumbnail.com/${vimeoId}.jpg`
      });
    }
  }
  
  // Dailymotion detection
  if (hostname.includes('dailymotion.com')) {
    const dmId = window.location.pathname.split('/video/')[1]?.split('_')[0];
    if (dmId) {
      videos.push({
        id: `dailymotion_${dmId}`,
        title: document.title.replace(' - Dailymotion', ''),
        url: window.location.href,
        duration: 'Unknown',
        quality: '720p',
        quality_options: ['1080p', '720p', '480p'],
        thumbnail: `https://www.dailymotion.com/thumbnail/video/${dmId}`
      });
    }
  }
  
  // Twitch detection
  if (hostname.includes('twitch.tv')) {
    const twitchUser = window.location.pathname.split('/').filter(Boolean)[0];
    if (twitchUser && !['directory', 'videos', 'clips'].includes(twitchUser)) {
      videos.push({
        id: `twitch_${twitchUser}`,
        title: `${twitchUser} - Twitch Stream`,
        url: window.location.href,
        duration: 'Live',
        quality: '720p',
        quality_options: ['1080p', '720p', '480p'],
        thumbnail: 'assets/placeholder.png'
      });
    }
  }
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === "ping") {
    sendResponse({ success: true, message: "Content script is active" });
    return true;
  }
  
  if (message.action === "scanForVideos") {
    try {
      console.log('Starting manual video scan...');
      const videos = detectVideos();
      console.log('Manual scan completed, found:', videos.length, 'videos');
      sendResponse({ success: true, videos });
    } catch (error) {
      console.error('Error detecting videos:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  }
});

// Wait for page to be ready
function waitForPageReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });
}

// Initial scan with better timing
async function performInitialScan() {
  try {
    await waitForPageReady();
    
    // Wait a bit more for dynamic content on YouTube
    if (isYouTube()) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const videos = detectVideos();
    if (videos.length > 0) {
      chrome.runtime.sendMessage({
        action: "videosDetected",
        videos: videos,
        url: location.href
      }, (response) => {
        // Handle response or error silently
        if (chrome.runtime.lastError) {
          console.log('Background script not ready:', chrome.runtime.lastError.message);
        } else {
          console.log('Videos sent to background script:', videos.length);
        }
      });
    } else {
      console.log('No videos found during initial scan');
    }
  } catch (error) {
    console.error('Error in initial video scan:', error);
  }
}

// Run initial scan
performInitialScan();

// Also listen for navigation changes on YouTube (SPA behavior)
if (isYouTube()) {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('YouTube navigation detected, rescanning...');
      setTimeout(performInitialScan, 2000);
    }
  }).observe(document, { subtree: true, childList: true });
}