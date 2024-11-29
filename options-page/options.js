// Saves options to chrome.storage
const saveOptions = () => {
  const isEnabledFeatureColorize = document.getElementById('colorize').checked;

  chrome.storage.sync.set(
    { isEnabledFeatureColorize: isEnabledFeatureColorize },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.classList.add('show');
      setTimeout(() => {
        status.classList.remove('show');
      }, 1000);
    }
  );
};

// Restores checkbox state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { isEnabledFeatureColorize: true },
    (items) => {
      document.getElementById('colorize').checked = items.isEnabledFeatureColorize;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
