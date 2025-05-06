const cardIndex = [
    'Strike',
    'Shield',
    'ShadowWalk',
    'Shadow',
    'TrueStrike',
    'Bash',
    'Shatter',
    'ShatterSplash',
    'Firebolt',
    'MagicMissile',
    'level1SpellSlotAtk',
    'unrelentingbarrage',
    'PoisonSpray',
    'ArcaneBoost',
    'HealingWord',
    'l1SpSlSkl',
    'ArcaneRecovery',
    'SpellSlot1Pwr',
    'MageArmor',
    'ShieldFaith',
    'Shillelagh',
    'ArcaneCult',
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
