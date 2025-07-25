/**
 * Colorize the Jira board
 */
const initJiraCustomiseColorizeBoard = () => {
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

    const collectTicketsAndSubtaskWrappers = () => {
      const columnSelector = '[data-testid="software-board.board-container.board.virtual-board.fast-virtual-list.fast-virtual-list-wrapper"]';
      const allTicketsAndSubtaskWrappers = document.querySelectorAll(`${columnSelector} > li > div`);

      allTicketsAndSubtaskWrappers.forEach((ticketOrSubtaskWrapper, index) => {
        if (ticketOrSubtaskWrapper.getAttribute('data-testid') === 'software-board.board-container.board.card-container.card-with-icc') {
          // this is a ticket

          let cardNumber;
          const cardElem = ticketOrSubtaskWrapper.querySelector('[id^="card-"]');
          if (cardElem) {
            cardNumber = cardElem.id.replace('card-', '');
          }

          if (!cardNumber) return;

          addCardNumberScaffoldingIfNotExists(cardNumber);
          cardNumberCollection[cardNumber].ticket = ticketOrSubtaskWrapper;
        } else {
          // this is a subtask wrapper

          let cardNumber;
          const cardNumberElem = ticketOrSubtaskWrapper.querySelector('[data-testid="software-board.board-container.board.card-group.card-group-header"] > span:first-child');

          if (cardNumberElem) {
            // this is a subtask wrapper in a different column than the parent ticket
            cardNumber = cardNumberElem.textContent;
          } else {
            // this is a subtask wrapper in the same column as the parent ticket

            // get the card number from the ticket right above this subtask wrapper
            const parentTicketElem = allTicketsAndSubtaskWrappers[index - 1];
            const cardElem = parentTicketElem?.querySelector('[id^="card-"]');
            if (cardElem) {
              cardNumber = cardElem.id.replace('card-', '');
            }
          }

          if (!cardNumber) return;

          addCardNumberScaffoldingIfNotExists(cardNumber);
          cardNumberCollection[cardNumber].subtaskWrappers.push(ticketOrSubtaskWrapper);
        }
      });
    };

    collectTicketsAndSubtaskWrappers();

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
      const ticketIdElem = cardGroup.ticket.querySelector('[role="presentation"] a :is(span, div)');

      if (ticketIdElem) {
        ticketIdElem.style.background = backgroundSoft;
        // make numbers a bit darker to stand out enough on coloured backgrounds
        ticketIdElem.style.color = '#172B4D';
      }

      // Depending on the Jira board settings, there is often no grabber element in the DOM. So create one here.
      // Having one in the DOM is not handled here anymore because I can basically only test my team's board settings.
      const ticketGrabberParentElem = cardGroup.ticket.querySelector('[data-testid="platform-card.ui.card.focus-container"] + div:not(:has(.custom-grabber)) [data-testid="platform-card.ui.card.card-content.footer"]')?.parentElement;
      if (ticketGrabberParentElem) {
        const fakeGrabberElem = document.createElement('div');
        fakeGrabberElem.classList.add('custom-grabber');
        fakeGrabberElem.style.position = 'absolute';
        fakeGrabberElem.style.top = '0';
        fakeGrabberElem.style.left = '0';
        fakeGrabberElem.style.height = '100%';
        fakeGrabberElem.style.width = '4px';
        fakeGrabberElem.style.borderTopLeftRadius = '3px';
        fakeGrabberElem.style.borderBottomLeftRadius = '3px';
        fakeGrabberElem.style.backgroundColor = backgroundStrong;
        fakeGrabberElem.style.zIndex = '1';
        ticketGrabberParentElem.prepend(fakeGrabberElem);
        ticketGrabberParentElem.style.isolation = 'isolate';
      }
    }

    cardGroup.subtaskWrappers.forEach((subtaskWrapper) => {
      subtaskWrapper.style.background = backgroundSoft;

      // remove the coloured border on the left-hand side of sub-tasks
      const subTaskCards = subtaskWrapper.querySelectorAll('[data-component-selector="platform-board-kit.ui.card-container"]');
      subTaskCards.forEach((subTaskCard) => {
        const subTaskGrabberElem = subTaskCard.querySelector('[data-test-id="platform-card.ui.card.focus-container"] div:empty');
        if (subTaskGrabberElem) {
          subTaskGrabberElem.style.backgroundColor = 'transparent';
        }
      });

      const subtaskWrapperHeader = subtaskWrapper.querySelector('[data-testid="software-board.board-container.board.card-group.card-group-header"]');
      if (subtaskWrapperHeader) {
        // this is a subtask wrapper in a different column than the parent ticket, thus, it has the card number and title in its header

        // make number and title a bit darker to stand out enough on coloured backgrounds
        subtaskWrapperHeader.style.color = '#172B4D';
      }
    });
  };

  const doTheActualThing = () => {
    const cardNumberCollection = getCardNumberCollection();
    Object.keys(cardNumberCollection).forEach((cardNumber) => {
      const cardGroup = cardNumberCollection[cardNumber];
      colorize(cardNumber, cardGroup);
    });
  };

  const colorizeBoard = ({ observer, observerTargetNode, observerConfig }) => {
    // stop MutationObserver
    // Keeping it running while manipulating the DOM would cause an infinite loop.
    observer.disconnect();

    // separate function so that e.g. early returns are possible but the MutationObserver is always restarted
    doTheActualThing();

    // `customiseBoard()` might mutate the DOM. Thus, we want to restart the MutationObserver AFTER all the DOM updates
    // have finished to prevent loops. To do so, we need two nested `requestAnimationFrame()` calls because this is called
    // BEFORE the next repaint.
    // I.e. this outer call fires before the next repaint
    requestAnimationFrame(() => {
      // fires before the _next_ next repaint
      // ...which is effectively _after_ the next repaint
      requestAnimationFrame(() => {
        // restart MutationObserver
        observer.observe(observerTargetNode, observerConfig);
      });
    });
  };

  return colorizeBoard;
};
