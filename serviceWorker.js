const setIcon = async (isEnabled) => {
  const canvas = new OffscreenCanvas(16, 16);
  const context = canvas.getContext('2d');

  if (isEnabled) {
    const objGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    objGradient.addColorStop(0, '#ff9f80');
    objGradient.addColorStop(1 / 5, '#fbbc58');
    objGradient.addColorStop(2 / 5, '#f3f01f');
    objGradient.addColorStop(3 / 5, '#99dc79')
    objGradient.addColorStop(4 / 5, '#2dc1dc');
    objGradient.addColorStop(1, '#b069f9');
    context.fillStyle = objGradient;
  } else {
    context.fillStyle = '#dfe1e5';
  }

  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = '10px Helvetica Neue,sans-serif';
  context.fillStyle = '#444444';
  context.fillText('Jira', 0, 11);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  chrome.action.setIcon({imageData: imageData});
};

// listen to changes of enable / disable flag
chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes.isJiraCustomiseEnabled) return;

  await setIcon(changes.isJiraCustomiseEnabled.newValue);
});

// Enable / disable customisation code when installed / updated. Uses previous setting, or falls back to being enabled.
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.get('isJiraCustomiseEnabled', async (items) => {
    const isEnabled = items.isJiraCustomiseEnabled ?? true;
    await chrome.storage.sync.set({ 'isJiraCustomiseEnabled': isEnabled });
    await setIcon(isEnabled);
  })
});

// set icon on Chrome startup
chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.sync.get('isJiraCustomiseEnabled', async (items) => {
    await setIcon(items.isJiraCustomiseEnabled);
  })
});

// toggle enable / disable flag on action icon click
chrome.action.onClicked.addListener(async () => {
  await chrome.storage.sync.get('isJiraCustomiseEnabled', async (items) => {
    await chrome.storage.sync.set({ 'isJiraCustomiseEnabled': !items.isJiraCustomiseEnabled });
  });
});
