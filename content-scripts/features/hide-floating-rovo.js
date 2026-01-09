/**
 * Hide the floating "Ask Rovo AI" button
 */
const initJiraCustomiseHideFloatingRovo = () => {
  const doTheActualThing = () => {
    const floatingRovoButton = document
      .querySelector('button[data-testid="platform-ai-button"]')
      ?.closest('[role="presentation"]');

    if (floatingRovoButton) {
      floatingRovoButton.style.display = 'none';
    }
  };

  const hideFloatingRovo = ({ observer, observerTargetNode, observerConfig }) => {
    // stop MutationObserver
    // Keeping it running while manipulating the DOM would cause an infinite loop.
    observer.disconnect();

    // separate function so that e.g. early returns are possible but the MutationObserver is always restarted
    doTheActualThing();

    // This function might mutate the DOM. Thus, we want to restart the MutationObserver AFTER all the DOM updates
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

  return hideFloatingRovo;
};
