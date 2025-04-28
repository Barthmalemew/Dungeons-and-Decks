const cardIndex = [
    'Strike',
    'Shield',
    'UnrelentingBarrage',
    'ShadowWalk',
    'Shadow',
    'TrueStrike',
    'Bash',
    'Shatter',
    'ShatterSplash',
    'Firebolt',
    'MagicMissile',
    'Spell Slot lvl 1',
]

/**
 * A collection of all existing cards in this game.
 * @type {import("../game/cards.js").CARD[]}
 */
export const cards = []

export const cardUpgrades = {}


for (const fileName of cardIndex) {
    const module = await import(`./cards/${fileName}.js`)
    cards.push(module.default)
    cardUpgrades[module.default.name] = module.upgrade
}
