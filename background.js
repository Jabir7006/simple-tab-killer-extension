chrome.action.onClicked.addListener((tab) => {
  // Ignore if the tab is already sleeping or if it's a browser specific page
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Get the tab details
  const url = tab.url;
  const title = tab.title;
  const favicon = tab.favIconUrl || '';

  // Construct the sleep URL
  const sleepUrl = chrome.runtime.getURL('sleep.html') + 
    `?url=${encodeURIComponent(url)}` + 
    `&title=${encodeURIComponent(title)}` + 
    `&favicon=${encodeURIComponent(favicon)}`;

  // Update the tab to the sleep URL
  chrome.tabs.update(tab.id, { url: sleepUrl });
});

// Create context menus when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "create-folder",
    title: "Create New Folder",
    contexts: ["action"]
  });
  
  chrome.contextMenus.create({
    id: "sleep-folder",
    title: "Sleep Tabs in Current Folder",
    contexts: ["action"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "create-folder") {
    // Inject script to prompt user for folder name
    // This will fail on restricted pages like chrome://newtab/
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.prompt("Enter new folder name:")
    }, (results) => {
      let folderName = "New Folder"; // Default name
      
      if (!chrome.runtime.lastError && results && results[0] && results[0].result) {
        folderName = results[0].result;
      }
      
      // If user clicked Cancel in prompt, results[0].result is null, so we shouldn't create it
      // But if lastError occurred (e.g. on chrome:// tab), we still want to create a default one
      if (!chrome.runtime.lastError && results && results[0] && results[0].result === null) {
        return; // User cancelled
      }
      
      // Create a new tab and add it to a new group (folder)
      chrome.tabs.create({}, (newTab) => {
        chrome.tabs.group({ tabIds: newTab.id }, (groupId) => {
          chrome.tabGroups.update(groupId, { title: folderName });
        });
      });
    });
  } else if (info.menuItemId === "sleep-folder") {
    // Check if the current tab is in a group
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      // Find all tabs in the same group and sleep them
      chrome.tabs.query({ groupId: tab.groupId }, (tabs) => {
        tabs.forEach((t) => {
          if (t.url.startsWith('chrome://') || t.url.startsWith('chrome-extension://')) return;
          
          const sleepUrl = chrome.runtime.getURL('sleep.html') + 
            `?url=${encodeURIComponent(t.url)}` + 
            `&title=${encodeURIComponent(t.title)}` + 
            `&favicon=${encodeURIComponent(t.favIconUrl || '')}`;
            
          chrome.tabs.update(t.id, { url: sleepUrl });
        });
      });
    } else {
      // Alert the user if the tab is not in a folder
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.alert("The current tab is not inside a folder!")
      }).catch(() => {
        // Fallback if we can't alert (e.g. on chrome:// pages)
        console.warn("The current tab is not inside a folder!");
      });
    }
  }
});
