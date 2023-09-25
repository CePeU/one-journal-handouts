import { addGMJournalButton } from "./hooks/addGMJournalButton";
import { registerSettings } from "./settings/settings";
import { logger } from "./shared/helpers";
import { registerSockets } from "./shared/sockets";

/**
 * Starting point of the module
 */
new (class OneJournalHandouts {
  /**
   * Init all the proper components on init
   */
  constructor() {
    // Init module
    this.init();
  }

  /**
   * Init module and settings
   */
  init() {
    Hooks.once("init", () => {
      logger("Initializing module");

      // Register settings
      registerSettings();

      // Register sockets
      registerSockets();

      // Hooks
      addGMJournalButton();
    });
  }
})();
