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
