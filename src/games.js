import Decks from './decks.js';

const Games = [
  {
    name: 'Spades',
    deck: Decks.find(deck => deck.name === 'standard52CardDeck').deck,
    cardBack: Decks.find(deck => deck.name === 'standard52CardDeck').back,
    players: [4],
    newUserObject: {
      name: '',
      seat: 'chatRoom',
      inGame: false
    },
    gameActions: {
      decisions: ['Partners', 'Endgame', 'Nil', 'Bags'],
      options: {
        partners: ['Across', 'None'],
        endgame: ['500 Points', '300 Points'],
        nil: ['+100/-100', 'Not Used'],
        bags: ['10 = -100 Points', 'As Points']
      },
      assignDealer: 'Random',
      deal: 'Start left of dealer, whole deck',
      bidding: 'Spades',
      rounds: {
        play: 'Each player, start with last winner else left of dealer',
        decideTrickWinner: 'High trump suit else high lead suit',
        scoreRound: 'Spades'
      },
      winner: 'endgame points'
    },
    gameData: {
      stage: -1,
      decided: {
        partners: '',
        endgame: '',
        nil: '',
        bags: ''
      },
      dealer: -1,
      deck: [],
      cards: {},
      cardsLeft: [],
      trump: 'Spades',
      allowedBids: ['Nil', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      bids: {},
      round: {
        turn: -1,
        cardsPlayed: {},
        spadesBroken: false,
        suitLed: '',
        scores: {},
        trickDecided: false,
        trickWinnerMessage: ''
      },
      gameScores: {},
      spadesBrokenWarning: false,
      followSuitWarning: false
    }
  },
  // {
  //   name: 'Rummy',
  //   deck: Decks.find(deck => deck.name === 'standard52CardDeck').deck,
  //   players: [2, 3, 4],
  //   deal: 7,
  //   newUserObject: {
  //     name: '',
  //     seat: 'chatRoom',
  //     cards: {
  //       hand: [],
  //       inFrontFaceUp: []
  //     },
  //     score: null,
  //     turn: false
  //   },
  //   gameActions: {
  //     decisions: ['Partners', 'Endgame'],
  //     options: {
  //       partners: ['Across', 'None'],
  //       endgame: ['500 Points', '300 Points']
  //     },
  //     assignDealer: 'Random', // not currently used
  //     deal: 'Start left of dealer, whole deck',
  //     bidding: 'Spades',
  //     rounds: {
  //       times: 13,
  //       play: 'Each player, start with last winner else left of dealer',
  //       determineWinner: 'High trump suit else high lead suit',
  //       scoreRound: 'Spades'
  //     },
  //     winner: 'endGame points'
  //   },
  //   gameData: {
  //     stage: -1,
  //     decided: {
  //       partners: '',
  //       endgame: ''
  //     },
  //     dealer: -1,
  //     deck: [],
  //     cards: {},
  //     cardsLeft: [],
  //     bids: {},
  //     trump: 'Spades',
  //     round: {
  //       turn: -1,
  //       suitLed: '',
  //       cardsPlayed: {},
  //       scores: {}
  //     }
  //   }
  // },
  // {
  //   name: 'Euchre',
  //   deck: Decks.find(deck => deck.name === 'euchreDeck').deck,
  //   players: [4],
  //   deal: 5,
  //   newUserObject: {
  //     name: '',
  //     partner: null,
  //     seat: 'chatRoom',
  //     cards: {
  //       hand: [],
  //       inCenterFaceUp: []
  //     },
  //     score: null,
  //     turn: false
  //   }
  // },
];



export default Games;
