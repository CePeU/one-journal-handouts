import { CONSTANTS } from "../shared/constants";
import BlacklistSettings from "./blacklist-settings";
const { ArrayField, StringField } = foundry.data.fields;

/** Settings global names */
export const SETTINGS = {
  GM_JOURNAL: "gm-journal",
  PLAYERS_JOURNAL: "players-journal",
  SHARING_MODE: "sharing-mode",
  DUPLICATED_JOURNAL: "duplicated-journal",
  OPEN_PAGE: "open-page",
  BLACKLIST: "blacklist"
};

/**
 * Get all journal entries and compute them in an object compatible with a dropdown menu
 * @returns {object | void} the list of journal entries
 */
const journalEntriesList = () => {
  const journalEntriesChoices = {};

  if (!game.journal) return;

  for (const [key, journal] of game.journal.entries()) {
    journalEntriesChoices[key] =
      journal.name.length > 30 ? `${journal.name.slice(0, 30)}...` : journal.name;
  }

  return journalEntriesChoices;
};

/** Register settings */
export function registerSettings() {
  // Blacklist hidden setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.BLACKLIST, {
    config: false,
    scope: CONST.SETTING_SCOPES.WORLD,
    type: new ArrayField(new StringField(), { initial: [], gmOnly: true })
  });

  // Blacklist menu
  game.settings.registerMenu(CONSTANTS.MODULE_NAME, SETTINGS.BLACKLIST, {
    label: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.BLACKLIST}.label`,
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.BLACKLIST}.name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.BLACKLIST}.hint`,
    restricted: true,
    type: BlacklistSettings
  });

  // GM Journal setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.GM_JOURNAL, {
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.GM_JOURNAL}-name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.GM_JOURNAL}-hint`,
    scope: "world",
    config: true,
    default: "all",
    type: new foundry.data.fields.StringField({
      blank: false,
      choices: () =>
        foundry.utils.mergeObject({ all: game.i18n.localize("all") }, journalEntriesList())
    })
  });

  // Players Journal setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.PLAYERS_JOURNAL, {
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.PLAYERS_JOURNAL}-name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.PLAYERS_JOURNAL}-hint`,
    scope: "world",
    config: true,
    default: "__!none!__",
    type: new foundry.data.fields.StringField({
      blank: true,
      choices: journalEntriesList
    })
  });

  // Sharing mode setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.SHARING_MODE, {
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.SHARING_MODE}-name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.SHARING_MODE}-hint`,
    scope: "world",
    config: true,
    default: "default",
    type: new foundry.data.fields.StringField({
      blank: false,
      choices: {
        default: game.i18n.localize("Default"),
        duplicate: game.i18n.localize("Duplicate"),
        delete: game.i18n.localize("Delete")
      }
    })
  });

  // Duplicated journal setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.DUPLICATED_JOURNAL, {
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.DUPLICATED_JOURNAL}-name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.DUPLICATED_JOURNAL}-hint`,
    scope: "world",
    config: true,
    default: "__!none!__",
    type: new foundry.data.fields.StringField({
      blank: true,
      choices: journalEntriesList
    })
  });

  // Open page setting
  game.settings.register(CONSTANTS.MODULE_NAME, SETTINGS.OPEN_PAGE, {
    name: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.OPEN_PAGE}-name`,
    hint: `${CONSTANTS.MODULE_NAME}.settings.${SETTINGS.OPEN_PAGE}-hint`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
}
