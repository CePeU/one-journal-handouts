import { SETTINGS } from "../settings/settings";
import { CONSTANTS } from "../shared/constants";
import { EVENTS } from "../shared/sockets";

/**
 * Add a button to the GM journal to share handouts to players
 */
export const addGMJournalButton = () => {
  Hooks.on("getJournalSheetHeaderButtons", (journal, buttons) => {
    // Only GM are allowed
    if (!game.users.current.isGM) return;

    // Making sure settings are set
    const gmJournalId = game.settings.get(CONSTANTS.MODULE_NAME, SETTINGS.GM_JOURNAL);
    const playersJournalId = game.settings.get(CONSTANTS.MODULE_NAME, SETTINGS.PLAYERS_JOURNAL);
    const sharingMode = game.settings.get(CONSTANTS.MODULE_NAME, SETTINGS.SHARING_MODE);
    const duplicatedJournalId = game.settings.get(
      CONSTANTS.MODULE_NAME,
      SETTINGS.DUPLICATED_JOURNAL
    );
    if (!gmJournalId || !playersJournalId) return;

    // Add the button
    if (buttons.find((button) => button.class === CONSTANTS.MODULE_NAME)) return;
    if (journal instanceof DocumentSheet) {
      if (gmJournalId === "all" && journal.document.id === playersJournalId) return;
      if (gmJournalId !== "all" && journal.document.id !== gmJournalId) return;

      buttons.unshift({
        icon: "fas fa-square-share-nodes fa-fw",
        label: `${CONSTANTS.MODULE_NAME}.share-with-players`,
        class: CONSTANTS.MODULE_NAME,

        onclick: async () => {
          // Making sure players journal exists
          const playersJournal = game.journal.get(playersJournalId);
          if (!playersJournal)
            return ui.notifications.error(
              game.i18n.localize(`${CONSTANTS.MODULE_NAME}.no-players-journal`)
            );

          // Get the currently viewed page
          const pageId = journal.pagesInView[0]?.dataset?.pageId;
          if (!pageId) return;

          // Check if page has already been created in the players journal (using flags)
          const existingPage = playersJournal.pages.find(
            (p) => p.flags?.[CONSTANTS.MODULE_NAME] === pageId
          );

          if (existingPage) {
            // If already created
            openJournal(playersJournal, existingPage.id);
          } else {
            // if not created yet
            const newPage = await createNewPage(journal, pageId, playersJournal);

            // If should duplicate
            if (sharingMode === "duplicate") {
              const duplicatedJournal = game.journal.get(duplicatedJournalId);

              if (!duplicatedJournal)
                return ui.notifications.error(
                  game.i18n.localize(`${CONSTANTS.MODULE_NAME}.no-duplicated-journal`)
                );

              await createNewPage(journal, pageId, duplicatedJournal);
              deletePage(journal, pageId);
            }

            // If should delete
            if (sharingMode === "delete") deletePage(journal, pageId);

            //Finally open the page
            openJournal(playersJournal, newPage.id);
          }

          // Inform GM of success
          ui.notifications.info(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.successful`));
        }
      });
    }
  });
};

/**
 * Clone and add a new page from the GM journal to the players journal
 * @param {JournalEntry} journal the GM journal
 * @param {string} pageId the page id to share
 * @param {JournalEntry} playersJournal  the players journal
 * @returns {JournalEntryPage} the newly created page
 */
const createNewPage = async (journal, pageId, playersJournal) => {
  // Clone the current page
  const page = Object.assign({}, journal.document.pages.find((p) => p.id === pageId).toObject());

  // Add a flag indicating the original page ID
  foundry.utils.setProperty(page, `flags.${CONSTANTS.MODULE_NAME}`, pageId);

  // Figure out the new sort (so this will be the last page added)
  const allSorts = playersJournal.pages.map((p) => p.sort);
  const currentMaxSort = allSorts.length ? Math.max(...allSorts) : 0;
  page.sort = currentMaxSort + 10_000;

  // Create a new page in the players journal
  const [newPage] = await playersJournal.createEmbeddedDocuments("JournalEntryPage", [page]);

  // Return the new page
  return newPage;
};

/**
 * Delete a page from a journal
 * @param {JournalEntry} journal the journal
 * @param {string} pageId the page id to delete
 */
const deletePage = async (journal, pageId) => {
  const page = journal.document.pages.find((p) => p.id === pageId);
  if (!page) return;

  await journal.document.deleteEmbeddedDocuments("JournalEntryPage", [page.id]);
};

/**
 * Open the a journal on a specific page id
 * @param {JournalEntry} journal the journal object
 * @param {string} pageId the page id
 */
const openJournal = (journal, pageId) => {
  // Open to players
  game.socket.emit(`module.${CONSTANTS.MODULE_NAME}`, {
    event: EVENTS.OPEN_PAGE,
    journalId: journal.id,
    pageId
  });

  // Open to GM if setting is enabled
  const openPage = game.settings.get(CONSTANTS.MODULE_NAME, SETTINGS.OPEN_PAGE);
  if (openPage) {
    journal.sheet.render(true, {
      pageId,
      sheetMode: JournalSheet.VIEW_MODES.SINGLE
    });
  }
};
