// StreamSave Pro Extension Diagnostic Script
// Run this in the browser console to debug video detection

console.log('=== StreamSave Pro Extension Diagnostic ===');

// Check if extension is loaded
function checkExtension() {
  console.log('\n1. Checking extension environment...');
  console.log('chrome object exists:', typeof chrome !== 'undefined');
  console.log('chrome.runtime exists:', chrome && typeof chrome.runtime !== 'undefined');
  console.log('chrome.runtime.id:', chrome?.runtime?.id);
  
  if (chrome?.runtime?.getManifest) {
    const manifest = chrome.runtime.getManifest();
    console.log('Extension name:', manifest.name);
    console.log('Extension version:', manifest.version);
  }
}

// Check content script injection
function checkContentScript() {
  console.log('\n2. Checking content script...');
  
  // Try to send a message to check if content script is loaded
  if (chrome?.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'ping'}, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not responding:', chrome.runtime.lastError.message);
          } else {
            console.log('Content script is active');
          }
        });
      }
    });
  }
}

// Check video elements on current page
function checkVideoElements() {
  console.log('\n3. Checking video elements on page...');
  console.log('Current URL:', window.location.href);
  console.log('Page title:', document.title);
  
  const videos = document.querySelectorAll('video');
  console.log('Video elements found:', videos.length);
  
  videos.forEach((video, index) => {
    console.log(`Video ${index + 1}:`, {
      src: video.src,
      currentSrc: video.currentSrc,
      duration: video.duration,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused
    });
    
    const sources = video.querySelectorAll('source');
    if (sources.length > 0) {
      console.log(`  Sources for video ${index + 1}:`);
      sources.forEach((source, si) => {
        console.log(`    Source ${si + 1}:`, source.src, source.type);
      });
    }
  });
}

// Test extension messaging
function testExtensionMessaging() {
  console.log('\n4. Testing extension messaging...');
  
  if (chrome?.runtime) {
    // Test getting detected videos
    chrome.runtime.sendMessage({action: "getDetectedVideos"}, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Error getting detected videos:', chrome.runtime.lastError.message);
      } else {
        console.log('Background script response for getDetectedVideos:', response);
      }
    });
    
    // Test scanning for videos
    setTimeout(() => {
      chrome.runtime.sendMessage({action: "scanForVideos"}, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error scanning for videos:', chrome.runtime.lastError.message);
        } else {
          console.log('Background script response for scanForVideos:', response);
        }
      });
    }, 1000);
  }
}

// Run all diagnostics
checkExtension();
checkContentScript();
checkVideoElements();
testExtensionMessaging();

console.log('\n=== Diagnostic complete ===');
console.log('Check the console messages above for any issues.');
console.log('If you see errors, the extension may not be properly loaded or may have permission issues.');
