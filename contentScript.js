(async function() {
	const customiseBoard = () => {
		/**
		 * Collect ticket and subtask wrapper elements grouped by ticket number
		 * @example return value
		 * 	{
		 * 		'DH-2': {
		 * 			ticket: 'Node',
		 * 			subtaskWrappers: ['Node', 'Node']
		 * 		},
		 * 		...
		 * 	}
		 */
		const getCardNumberCollection = () => {
			const cardNumberCollection = {};

			const addCardNumberScaffoldingIfNotExists = (cardNumber) => {
				if (!cardNumberCollection[cardNumber]) {
					cardNumberCollection[cardNumber] = {
						ticket: undefined,
						subtaskWrappers: []
					};
				}
			};

			const collectTickets = () => {
				const allCardElems = document.querySelectorAll('[data-component-selector="platform-board-kit.ui.card-container"]');
				allCardElems.forEach((cardElem) => {
					// ignore sub-task cards to get only main tickets
					if (cardElem.closest('[data-testid="software-board.board-container.board.card-group.card-group"]')) return;

					const cardNumber = cardElem.id.replace('card-', '');
					if (!cardNumber) return;

					addCardNumberScaffoldingIfNotExists(cardNumber);
					cardNumberCollection[cardNumber].ticket = cardElem;
				});
			};

			const collectSubtaskWrappers = () => {
				const subtaskWrappers = document.querySelectorAll('[data-testid="software-board.board-container.board.card-group.card-group"]');
				subtaskWrappers.forEach((subtaskWrapper) => {
					let cardNumber;

					// subtask wrappers that are in a different column than the parent ticket
					const cardNumberElem = subtaskWrapper.querySelector('[data-testid="software-board.board-container.board.card-group.card-group-header"] > span:first-child');
					if (cardNumberElem) {
						cardNumber = cardNumberElem.textContent;
					} else {
						// TODO find card number for subtask wrappers in the same column as their parent tickets
					}

					if (!cardNumber) return;

					addCardNumberScaffoldingIfNotExists(cardNumber);
					cardNumberCollection[cardNumber].subtaskWrappers.push(subtaskWrapper);
				});
			};

			collectTickets();
			collectSubtaskWrappers();

			return cardNumberCollection;
		};

		/**
		 * Mark each ticket and its subtasks with a (relatively) unique colour
		 */
		const colorize = (cardNumber, cardGroup) => {
			const cardNumberMatches = cardNumber.match(/\d+/);
			if (!cardNumberMatches?.[0]) return;

			const colors = [
				'#f97b00',
				'#ff9f80',
				'#fba96a',
				'#fbbc58',
				'#f9cb00',
				'#f3f01f',
				'#d7f900',
				'#afd641',
				'#b3cf00',
				'#72cf00',
				'#54b30b',
				'#99dc79',
				'#00a816',
				'#65dab6',
				'#00e4c9',
				'#7de1f3',
				'#2dc1dc',
				'#4a7bf1',
				'#0400ff',
				'#5700f9',
				'#9499f1',
				'#b069f9',
				'#c694f1',
				'#ce6cc9',
				'#f97e82',
				'#f90008',
			];
			const opacity = 0.4;
			const hexAlpha = Math.round(opacity * 255).toString(16);

			const issueNumber = +cardNumberMatches[0];
			// get an existing index based on issue number so that an issue will always have the same colour
			const colorIndexByIssue = issueNumber % colors.length;
			const backgroundStrong = colors[colorIndexByIssue];
			const colorSoft = `${colors[colorIndexByIssue]}${hexAlpha}`;
			const backgroundSoft = `white linear-gradient(${colorSoft}, ${colorSoft})`;

			if (cardGroup.ticket) {
				const ticketIdElem = cardGroup.ticket.querySelector('[role="presentation"] a span');
				const ticketGrabberElem = cardGroup.ticket.querySelector('[data-test-id="platform-card.ui.card.focus-container"] > div:empty');

				if (ticketIdElem) {
					ticketIdElem.style.background = backgroundSoft;
					// make numbers a bit darker to stand out enough on coloured backgrounds
					ticketIdElem.style.color = '#172B4D';
				}
				if (ticketGrabberElem) {
					ticketGrabberElem.style.background = backgroundStrong;
				}
			}

			cardGroup.subtaskWrappers.forEach((subtaskWrapper) => {
				subtaskWrapper.style.background = backgroundSoft;

				// remove the coloured border on the left-hand side of sub-tasks
				const subTaskCards = subtaskWrapper.querySelectorAll('[data-component-selector="platform-board-kit.ui.card-container"]');
				subTaskCards.forEach((subTaskCard) => {
					const subTaskGrabberElem = subTaskCard.querySelector('[data-test-id="platform-card.ui.card.focus-container"] > div:empty');
					subTaskGrabberElem.style.background = 'transparent';
				});
			});
		};

		const cardNumberCollection = getCardNumberCollection();
		Object.keys(cardNumberCollection).forEach((cardNumber) => {
			const cardGroup = cardNumberCollection[cardNumber];
			colorize(cardNumber, cardGroup);
		});
	};

	const initBoardCustomisation = () => {
		const targetNode = document.body;
		// `attributes: false` is crucial! Otherwise, e.g. adding a class in the callback triggers a mutation, which
		// triggers the callback again... resulting in an infinite loop.
		const config = { attributes: false, childList: true, subtree: true };
		const mutationsCallback = (mutationsList, observer) => {
			customiseBoard();
		};
		const observer = new MutationObserver(mutationsCallback);
		observer.observe(targetNode, config);
	};

	// Initialise customisation logic if extension action enabled flag is true
	await chrome.storage.sync.get('isJiraCustomiseEnabled', (items) => {
		if (!items.isJiraCustomiseEnabled) return;

		initBoardCustomisation();
	});
})();
