let Data = [
  {
    gameNumber: '1234',
    game: 'Rummy',
    players: 2,
    users: [
      {
        name: 'Pat',
        partner: null,
        seated: true,
        cards: {
          hand: [0, 21, 36, 51],
          inFrontFaceUp: [],
          inFrontFaceDown: [],
          inCenterFaceUp: [],
          inCenterFaceDown: []
        },
        score: 0,
        turn: false
      },
      {
        name: 'Jeff',
        partner: null,
        seated: true,
        cards: {
          hand: [1, 2, 3, 22, 50],
          inFrontFaceUp: [],
          inFrontFaceDown: [],
          inCenterFaceUp: [],
          inCenterFaceDown: []
        },
        score: 0,
        turn: true
      }
    ],
    otherCardLocations: {
      deck: [38, 17, 5],
      pile: [6],
      outOfPlay: []
    },
    chatLog: [
      '12:34pm Ben: Hi guise, lol.',
      '12:34pm Brian: whassssuuuuupppp',
      '12:35pm Dani: um, hi',
      '12:36pm Caroline entered the room',
      '12:36pm Caroline: Yellow!'
    ]
  },
  {
    gameNumber: 1237,
    game: 'Rummy',
    players: 2,
    users: [
      {
        name: 'Bill',
        partner: null,
        seated: true,
        cards: {
          hand: [0, 21, 36, 51],
          inFrontFaceUp: [],
          inFrontFaceDown: [],
          inCenterFaceUp: [],
          inCenterFaceDown: []
        },
        score: 0,
        turn: false
      },
      {
        name: 'Bob',
        partner: null,
        seated: true,
        cards: {
          hand: [1, 2, 3, 22, 50],
          inFrontFaceUp: [],
          inFrontFaceDown: [],
          inCenterFaceUp: [],
          inCenterFaceDown: []
        },
        score: 0,
        turn: true
      }
    ],
    otherCardLocations: {
      deck: [38, 17, 5],
      pile: [6],
      outOfPlay: []
    },
    chatLog: [
      '12:34pm Ben: Hi guise, lol.',
      '12:34pm Brian: whassssuuuuupppp',
      '12:35pm Dani: um, hi',
      '12:36pm Caroline entered the room',
      '12:36pm Caroline: Yellow!'
    ]
  },
];

export default Data;
