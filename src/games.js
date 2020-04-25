import Decks from './decks.js';

const Games = [
  {
    name: 'War',
    deck: Decks.find(deck => deck.name === 'standard52CardDeck').deck,
    players: [2, 3, 4],
    deal: 'whole',
    newUserObject: {
      name: '',
      seat: 'chatRoom',
      cards: {
        pile: []
      },
      score: null,
      turn: false
    }
  },
  {
    name: 'Rummy',
    deck: Decks.find(deck => deck.name === 'standard52CardDeck').deck,
    players: [2, 3, 4],
    deal: 7,
    newUserObject: {
      name: '',
      seat: 'chatRoom',
      cards: {
        hand: [],
        inFrontFaceUp: []
      },
      score: null,
      turn: false
    }
  },
  {
    name: 'Spades',
    deck: Decks.find(deck => deck.name === 'standard52CardDeck').deck,
    players: [4],
    newUserObject: {
      name: '',
      partner: null,
      seat: 'chatRoom',
      cards: {
        hand: [],
        inCenterFaceUp: []
      },
      score: null,
      turn: false,
      inGame: false
    },
    gameplay: {
      assignDealer: 'Random',
      deal: 'Start left of dealer, whole deck',
      bidding: 'Spades',
      trump: 'Spades',
      round: {
        times: 13,
        play: 'Each player, start with last winner else left of dealer',
        determineWinner: 'Spades',
        scoreRound: 'Winner +1'
      },
      determineWinner: 'Spades',
      endGame: ['500 Points', '300 Points']
    }
  },
  {
    name: 'Euchre',
    deck: Decks.find(deck => deck.name === 'euchreDeck').deck,
    players: [4],
    deal: 5,
    newUserObject: {
      name: '',
      partner: null,
      seat: 'chatRoom',
      cards: {
        hand: [],
        inCenterFaceUp: []
      },
      score: null,
      turn: false
    }
  },
];



export default Games;
