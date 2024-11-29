(async function() {
	const initJiraCustomisation = async () => {
		// Users can enable / disable features of the extension on the options page. The options are stored in chrome.storage.
		// Get the user preferences from the storage to know which features should run.
		const storageItems = await chrome.storage.sync.get(
			// define which keys to fetch from the storage, and define default values
			// see https://developer.chrome.com/docs/extensions/reference/api/storage#method-StorageArea-get
			{ isEnabledFeatureColorize: true }
		);

		const isEnabledFeatureColorize = !!storageItems.isEnabledFeatureColorize;

		// Initialise each feature once. Only the returned functions need to be called often in the MutationObserver code.
		let colorizeBoard;
		if (isEnabledFeatureColorize) {
			colorizeBoard = initJiraCustomiseColorizeBoard();
		}

		const observerTargetNode = document.body;
		const observerConfig = { attributes: false, childList: true, subtree: true };
		const mutationsCallback = (mutationsList, observer) => {
			// call the features
			if (colorizeBoard) {
				colorizeBoard({ observer, observerTargetNode, observerConfig });
			}
		};
		const observer = new MutationObserver(mutationsCallback);
		observer.observe(observerTargetNode, observerConfig);
	};

	// Initialise customisation logic if extension action enabled flag is true
	await chrome.storage.sync.get('isJiraCustomiseEnabled', (items) => {
		if (!items.isJiraCustomiseEnabled) return;

		initJiraCustomisation();
	});
})();
