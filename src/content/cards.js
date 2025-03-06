const cardIndex = [
    'Strike',
    'Shield',
    'Unrelenting Barrage',
    'Shadow Walk',
    'Shadow',
]

@type {import("../game/cards.js").CARD[]}

export const cards = []

export const cardUpgrades = {}


for (const fileName of cardIndex) {
    const module = await import(`./cards/${fileName}.js`)
    cards.push(module.default)
    cardUpgrades[module.default.name] = module.upgrade
}
