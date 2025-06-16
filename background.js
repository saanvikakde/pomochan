let timer = {
    running: false,
    endTime: null,
    timeoutId: null,
  };
  
  // Handle messages from popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START_TIMER") {
      const duration = request.duration || 25; // minutes
      timer.running = true;
      timer.endTime = Date.now() + duration * 60 * 1000;
  
      // Clear existing timeout (if any)
      if (timer.timeoutId) {
        clearTimeout(timer.timeoutId);
      }
  
      timer.timeoutId = setTimeout(() => {
        timer.running = false;
        timer.endTime = null;
        timer.timeoutId = null;
  
        // Send a notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "assets/icon128.png", 
          title: "Pomochan says:",
          message: "Pomodoro complete! Time for a break 🍅⏰",
          priority: 2,
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
              console.error("Notification error:", chrome.runtime.lastError.message);
            } else {
              console.log("Notification shown:", notificationId);
            }
        });
      }, duration * 60 * 1000);
    }
  
    if (request.type === "PAUSE_TIMER") {
      if (timer.timeoutId) clearTimeout(timer.timeoutId);
      timer.running = false;
      timer.timeoutId = null;
      timer.endTime = null;
    }
  
    if (request.type === "RESET_TIMER") {
      if (timer.timeoutId) clearTimeout(timer.timeoutId);
      timer.running = false;
      timer.timeoutId = null;
      timer.endTime = null;
    }
  
    if (request.type === "GET_TIMER") {
      sendResponse({ pomodoro: timer });
    }
  });
  