import { CONSTANTS } from "./constants";

/** Events global names */
export const EVENTS = {
  OPEN_PAGE: "open-page"
};

/**
 * Register sockets for the module
 */
export const registerSockets = () => {
  // Render a journal entry page
  game.socket.on(`module.${CONSTANTS.MODULE_NAME}`, ({ event, journalId, pageId }) => {
    if (event !== EVENTS.OPEN_PAGE) return;

    const journal = game.journal.get(journalId);
    if (!journal) return;

    journal.sheet.render(true, {
      pageId,
      sheetMode: JournalSheet.VIEW_MODES.SINGLE
    });
  });
};
