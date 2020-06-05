import standard52CardDeck from './standard52CardDeck/deck.js';
const euchreCards = [
  '9S', '10S', 'JS', 'QS', 'KS', 'AS',
  '9D', '10D', 'JD', 'QD', 'KD', 'AD',
  '9C', '10C', 'JC', 'QC', 'KC', 'AC',
  '9H', '10H', 'JH', 'QH', 'KH', 'AH',
];

const Decks = [
  {
    name: 'standard52CardDeck',
    deck: standard52CardDeck.deck,
    joker: standard52CardDeck.joker,
    back: standard52CardDeck.back,
  },
  {
    name: 'euchreDeck',
    deck: standard52CardDeck.deck.filter(card => euchreCards.includes(card.id)),
    scoreCards: standard52CardDeck.deck.filter(card => ['4S', '6S', '4H', '6H'].includes(card.id)),
    back: standard52CardDeck.back,
  },

];

export default Decks;
