import C2S from './2S.png';
import C3S from './3S.png';
import C4S from './4S.png';
import C5S from './5S.png';
import C6S from './6S.png';
import C7S from './7S.png';
import C8S from './8S.png';
import C9S from './9S.png';
import C10S from './10S.png';
import CJS from './JS.png';
import CQS from './QS.png';
import CKS from './KS.png';
import CAS from './AS.png';
import C2D from './2D.png';
import C3D from './3D.png';
import C4D from './4D.png';
import C5D from './5D.png';
import C6D from './6D.png';
import C7D from './7D.png';
import C8D from './8D.png';
import C9D from './9D.png';
import C10D from './10D.png';
import CJD from './JD.png';
import CQD from './QD.png';
import CKD from './KD.png';
import CAD from './AD.png';
import C2C from './2C.png';
import C3C from './3C.png';
import C4C from './4C.png';
import C5C from './5C.png';
import C6C from './6C.png';
import C7C from './7C.png';
import C8C from './8C.png';
import C9C from './9C.png';
import C10C from './10C.png';
import CJC from './JC.png';
import CQC from './QC.png';
import CKC from './KC.png';
import CAC from './AC.png';
import C2H from './2H.png';
import C3H from './3H.png';
import C4H from './4H.png';
import C5H from './5H.png';
import C6H from './6H.png';
import C7H from './7H.png';
import C8H from './8H.png';
import C9H from './9H.png';
import C10H from './10H.png';
import CJH from './JH.png';
import CQH from './QH.png';
import CKH from './KH.png';
import CAH from './AH.png';
import C0J from './0Joker.png';
import C0B from './0Back.png';

// Create a card object for each card in the standard deck
const pictures = [
  C2S, C3S, C4S, C5S, C6S, C7S, C8S, C9S, C10S, CJS, CQS, CKS, CAS,
  C2D, C3D, C4D, C5D, C6D, C7D, C8D, C9D, C10D, CJD, CQD, CKD, CAD,
  C2C, C3C, C4C, C5C, C6C, C7C, C8C, C9C, C10C, CJC, CQC, CKC, CAC,
  C2H, C3H, C4H, C5H, C6H, C7H, C8H, C9H, C10H, CJH, CQH, CKH, CAH
];
const rank = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
const suit = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
let cards = [];
for (let s = 0; s < suit.length; s++) {
  for (let r = 0; r < rank.length; r++) {
    cards.push({
      id: (/^\d+$/.test(rank[r]) ? rank[r] : rank[r].charAt(0)) + suit[s].charAt(0),
      picture: pictures[cards.length],
      title: rank[r] + ' of ' + suit[s]
    });
  }
}

// including the joker and the back of the cards
const deck = {
  deck: cards,
  joker: {
    id: '0J',
    picture: C0J,
    title: 'Joker'
  },
  back: {
    id: '0B',
    picture: C0B
  }
};

export default deck;
