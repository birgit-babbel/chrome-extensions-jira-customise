(async function() {
	// Initialise each feature once. Only the returned functions need to be called often in the MutationObserver code.
	const colorizeBoard = initJiraCustomiseColorizeBoard();

	const initJiraCustomisation = () => {
		const observerTargetNode = document.body;
		// `attributes: false` is crucial! Otherwise, e.g. adding a class in the callback triggers a mutation, which
		// triggers the callback again... resulting in an infinite loop.
		const observerConfig = { attributes: false, childList: true, subtree: true };
		const mutationsCallback = (mutationsList, observer) => {
			colorizeBoard({ observer, observerTargetNode, observerConfig });
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
