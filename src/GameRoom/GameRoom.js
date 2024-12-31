import React, { Component } from 'react';
import io from 'socket.io-client';
import GameTable from './GameTable.png';
import './GameRoom.css';

let Socket = '';
let keepAliveInterval = '';

class GameRoom extends Component {
  constructor (props) {
    super(props)
    this.state = {
      gameNumber: 0,
      game: '',
      players: 0,
      users: '',
      seatedNames: ['', '', '', ''],
      inGame: false,
      gameStages: ['', ''],
      formSizes: {},
      gameData: {
        stage: -1,
        decided: {},
        dealer: -1,
        deck: [],
        cards: {},
        cardsLeft: [],
        trump: 'Spades',
        allowedBids: [],
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
      },
      chatLog: '',
      client: {
        userName: '',
        userSeat: 'chatRoom',
        seatRotation: [0, 1, 2, 3],
        cards: [],
        upCard: '',
        thisTricksCards: {},
        chatInputValue: ''
      }
    };
  }

  componentDidMount() {
    // Create WebSocket between client and server
    Socket = io(this.props.serverURL, {
      reconnection: true,  // Enable reconnection
      reconnectionAttempts: 100,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,  // Set timeout for initial connection
    });

    // Provide client data to server
    const initialData = {
      userName: '' + this.props.userName,
      gameNumber: '' + this.props.gameNumber,
      newUserObject: JSON.stringify(this.props.gameObject.newUserObject)
    };
    Socket.emit('first-contact', initialData);

    // Prevent timeout for inactive client
    Socket.on('keepAlive', () => this.keepAlive());

    // Receive the current gameRoom state
    Socket.on('gameRoomState', gameRoom => this.buildRoom(gameRoom));

    // Handles all game updates after initial gameRoomState
    Socket.on('updateRoom', data => this.updateRoom(data));
  }
  componentWillUnmount() {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    Socket.off('reconnect');
    Socket.off('reconnect_failed');
    Socket.off('disconnect');
  }

  keepAlive() {
    // Send Ping
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => Socket.emit('keepAlive', ''), 10000)
  }
  buildRoom(gameRoom) {
    // Defines the current state of the room

    // Resize gameRoom
    document.documentElement.style.zoom = `${window.innerHeight / 750}`;

    // Define gameStages
    const allStages = ['decisions', 'assignDealer', 'deal', 'bidding', 'trump', 'rounds', 'winner'];
    const gameStages = Object.keys(this.props.gameObject.gameActions).filter(key => allStages.includes(key));

    // Define user related
    const users = JSON.parse(gameRoom.users);
    let seatedNames = ['', '', '', ''];
    let inGame = false;
    for (let x = 0; x < users.length; x++) {
      if ([0, 1, 2, 3].includes(users[x].seat)) {
        seatedNames[users[x].seat] = users[x].name;
      }
      if (users[x].inGame === true) {inGame = true;}
    }

    // Define formSizes
    const formSizes = {
      decisions: {
        height: 34 * Object.keys(this.props.gameObject.gameActions.decisions).length + 48,
        top: (750 - (34 * Object.keys(this.props.gameObject.gameActions.decisions).length)) / 2 - 1
      },
      default: {
        height: 46,
        top: 350
      }
    }

    // Define chatLog
    let chatLog = '';
    JSON.parse(gameRoom.chatLog).forEach(line => {
      chatLog += line + '\n';
    });

    this.setState({
      gameNumber: this.props.gameNumber, // Final
      game: gameRoom.game, // Final
      players: parseInt(gameRoom.players, 10), // Final
      users: users, // Database current
      seatedNames: seatedNames, // Database current
      inGame: inGame, // Database current
      gameStages: gameStages, // Final
      formSizes: formSizes, // Final
      gameData: JSON.parse(gameRoom.gameData), // Database current
      chatLog: chatLog, // Database current
      client: {
        userName: this.props.userName, // Final
        userSeat: 'chatRoom', // Initial
        seatRotation: [0, 1, 2, 3], // Initial
        cards: [], // Initial
        upCard: '', // Initial
        thisTricksCards: {}, // Initial
        chatInputValue: '' // Initial
      }
    })  
  }
  updateRoom(data) {
    // Handle each update

    // Determine which type of updates are needed
    const keys = Object.keys(data);
    let newState = Object.assign({}, this.state);

    // Update each key
    keys.forEach(key => {
      switch(key) {
        case 'chatLog': // Add line to chatLog
          newState.chatLog += data.chatLog + '\n';
          break;
        case 'gameData': // Update gameData
          // If multiple updates then update users first
          if (keys.includes('users')) { newState = this.userUpdate(data, newState); }
          newState = this.gameDataUpdate(data, newState);
          break;  
        case 'users': // Update users
          newState = this.userUpdate(data, newState);
          break;
        default:
          break;
      }
    });

    // Set state
    this.setState(newState);

    // After effects
    const textarea = document.querySelector('#chatLog');
    textarea.scrollTop = textarea.scrollHeight;
  }
  userUpdate(data, newState) {
    // Update user related data

    // Define seats and inGame status
    const users = JSON.parse(data.users);
    let seatedNames = ['', '', '', ''];
    let inGame = false;
    for (let x = 0; x < users.length; x++) {
      if ([0, 1, 2, 3].includes(users[x].seat)) {
        seatedNames[users[x].seat] = users[x].name;
      }
      if (users[x].inGame === true) {inGame = true;}
    }
    const userSeat = users.find(user => user.name === newState.client.userName).seat;

    // Format new user data
    newState.users = users;
    newState.seatedNames = seatedNames;
    newState.inGame = inGame;
    newState.client.userSeat = userSeat;
    return newState;
  }
  gameDataUpdate(data, newState) {
    // Update game related data
    const newGameData = JSON.parse(data.gameData);
    newState.gameData = newGameData;

    // Update cards and card locations
    let cards = [];
    if (Object.keys(newState.gameData.cards).length > 0) {

      // Update clients cards 
      if (newState.seatedNames.includes(this.state.client.userName)) {
        cards = newState.gameData.cards['player' + newState.client.userSeat].map((cardId) => {return (
          this.props.gameObject.deck.find(cardObject => cardObject.id === cardId) ) });
      }

      // Update thisTricksCards that displays in the center of the gameTable
      Object.keys(newState.gameData.round.cardsPlayed).forEach(player => {
        newState.client.thisTricksCards[player] =
            this.props.gameObject.deck.find(cardObject => 
          cardObject.id === newState.gameData.round.cardsPlayed[player])
      });
      if (Object.keys(newState.gameData.round.cardsPlayed).length === 0) {
        newState.client.thisTricksCards = {};
      }

      // Remove upCard property from card img holder that was just played
      Object.keys(newState.gameData.round.cardsPlayed).forEach(player => {
        let playerPlus = player.slice(0, -1) + ((parseInt(player.slice(-1), 10) + 1) % newState.players);
        if ((this.isDataThere(newState.client.thisTricksCards, player) && 
            !this.isDataThere(newState.client.thisTricksCards, playerPlus))
            || Object.keys(newState.gameData.round.cardsPlayed).length === this.state.players) {
          if (player.slice(-1) === '' + newState.client.userSeat) {
            newState.client.upCard = '';
          }
        }
      });
    }
    // Update cardsLeft for displaying opponents' remaining card count
    newState.gameData.cardsLeft = Object.keys(newState.gameData.cards).map((seat, index) => {
        return newState.gameData.cards['player' + index].length});

    // If every player has laid a card then decideTrickWinner or scoreRound and checkEndgame
    if (this.state.gameStages[newState.gameData.stage] === 'rounds' &&
        Object.keys(newState.client.thisTricksCards).length === this.state.players) {

      // Limit one user to emit trick winner or score update
      if (newState.client.userSeat === 0) {
        if (!newState.gameData.round.trickDecided) {
          // Decide trick if not decided
          if (newState.gameData.round.trickWinnerMessage === '') {
            this.decideTrickWinner(newState);
          }
        } else {
          // Reset for next trick
          newState.gameData.round.trickDecided = false;
          newState.gameData.round.trickWinnerMessage = '';
          newState.gameData.round.cardsPlayed = {};
          
          // If no cards left then scoreRound and checkEndgame
          if (newState.gameData.cardsLeft[0] === 0) {
            newState = this.scoreRound(newState);
            newState = this.checkEndgame(newState);
          }

          // Update all players with new data
          const data = {
            stage: newState.gameData.stage,
            dealer: newState.gameData.dealer,
            bids: newState.gameData.bids,
            round: newState.gameData.round,
            gameScores: newState.gameData.gameScores
          }
          Socket.emit('updateGameData', data);
        }
      }
    }

    // Save only user cards and hide opponents' cards from state reading users
    newState.client.cards = cards;
    newState.gameData.cards = {};
    return newState;
  }


  writeChat(e) {
    // Record chat input text change
    const newState = this.postData(this.state, 'client.chatInputValue', e.target.value);
    this.setState(newState);
  }
  sendChat(e) {
    e.preventDefault();
    // Send user chat and reset chat input
    Socket.emit('chatLogMessage', this.state.client.chatInputValue.slice(0, 1000));
    const newState = this.postData(this.state, 'client.chatInputValue', '');
    this.setState(newState);
  }
  sitDown(e) {
    e.preventDefault();
    // Post seat change to server
    const seat = this.state.client.seatRotation[parseInt(e.target.id.slice(-1), 10)];
    const userInfo = this.state.users.find(user => user.name === this.state.client.userName);
    userInfo.seat = seat;
    if (this.state.inGame) { userInfo.inGame = true; }
    Socket.emit('updateUser', userInfo);

    // Rotate the seats so the client's seat is at the bottom of the screen
    const rotation = [0, 1, 2, 3, 0, 1, 2, 3].slice(seat + 1, seat + 5);
    const newState = this.postData(this.state, 'client.seatRotation', rotation);
    this.setState(newState);
  }
  standUp(e) {
    e.preventDefault();
    // Post seat change to server and cards if needed
    let userNewSeat = this.props.gameObject.newUserObject;
    userNewSeat.name = this.state.client.userName;

    //
    // Hold onto this for now until decided about sorting cards
    // What if user is disconnected with cards needing to be uploaded?
    //
    // if (this.state.client.cards.length > 0) {
    //   let cards = {};
    //   cards = this.postData(cards, 'player' + this.state.client.userSeat,
    //       this.state.client.cards.map(card => {return(card.id)}));
    //   const data = {cards: cards};
    //   Socket.emit('updateUserAndGameData', {user: userNewSeat, gameData: data});
    // } else {
      Socket.emit('updateUser', userNewSeat);
    // }
  }
  startGame(e) {
    e.preventDefault();
    // Send a call to the server and update all the seated players' inGame statuses
    Socket.emit('setInGame', true);

    // Enter the first stage of the game
    Socket.emit('updateGameData', {stage: 0});
  }
  endGame() {
    // Send a call to the server and update all the seated players' inGame statuses
    Socket.emit('setInGame', false);
  }
  postDecisions(e) {
    // Only the user who decided enters this function
    e.preventDefault();
    // Post decisions made about the game and move to the next stage

    // Create decided object for gameData and message for chatLog
    let decided = this.state.gameData.decided;
    let message = this.state.client.userName + ' set the game options as:';
    const elements = document.getElementsByClassName('select');
    Object.keys(decided).forEach((select, i) => {
      decided[Object.keys(decided)[i]] = elements[i].options[elements[i].selectedIndex].text;
      message += '\n  ' + this.props.gameObject.gameActions.decisions[i] + ': ' + decided[Object.keys(decided)[i]]
    });

    // Format data
    const stage = this.state.gameData.stage + 1;
    let data = {decided: decided, stage: stage};

    // Game specifics
    if (this.state.game === 'Spades' && decided.nil === 'Not Used') {
      data.allowedBids = this.state.gameData.allowedBids.slice(1);
    }

    // Emit the gameData, the decisions to the other players, and move to the next stage
    Socket.emit('updateGameData', data);
    Socket.emit('gameEventMessage', message);
    if (this.state.gameStages[stage] === 'assignDealer') { this.assignDealer(); }
  }
  assignDealer() {
    // Only the user who decided enters this function
    // Assign the dealer

    // Format data
    const dealer = this.randomIntFromInterval(0, this.state.players - 1);
    const stage = this.state.gameStages.indexOf('assignDealer') + 1
    const data = {dealer: dealer, stage: stage};
    const message = this.state.seatedNames[dealer] + ' has randomly been chosen to deal';

    // Update gameData and send chatLog of event
    // A little pause while the previous 2 emits from postDecisions do their thing
    setTimeout(function(){
      Socket.emit('updateGameData', data);
      Socket.emit('gameEventMessage', message);
    }, 500);
  }
  shuffle(deck, post) {
    // Only dealer enters this function
    // Shuffle deck

    // Fisher-Yates Shuffle
    let currentIndex = deck.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temporaryValue;
    }

    // Update gameData and send chatLog of event
    const data = {deck: deck};
    const message = this.state.seatedNames[this.state.gameData.dealer] + ' shuffled the deck';
    Socket.emit('updateGameData', data);
    if (post) { Socket.emit('gameEventMessage', message); }
    return(deck);
  }
  deal(deck, players) {
    // Only dealer enters this function
    // Deal to players

    // Prevent dealing twice and shuffle once more to throw off state reading users
    document.querySelector('#shuffle').disabled = true;
    document.querySelector('#deal').disabled = true;
    let newDeck = this.shuffle(deck, false);

    // Deal
    let cards = {};
    for (let x = 0; x < players; x++) {
      cards['player' + x] = [];
    }
    const dealerSeat = this.state.gameData.dealer;
    if(this.props.gameObject.gameActions.deal.includes('Start left of dealer, whole deck')) {
      for (let x = 0; x < newDeck.length; x++) {
        cards['player' + ((dealerSeat + 1 + x) % players)].push(newDeck[x]);
        newDeck[x] = '';
      }

      // Sort all players hands
      Object.keys(cards).forEach((hand, index) => {
        cards[Object.keys(cards)[index]] = this.autoSort(cards[hand])
      });
    }

    // Format data
    const stage = this.state.gameData.stage + 1;
    const round = this.postData(this.state.gameData.round, 'turn', (dealerSeat + 1) % this.state.players);
    const data = {cards: cards, deck: newDeck.filter(String), stage: stage, round: round};
    const message = this.state.seatedNames[this.state.gameData.dealer] + ' dealt';

    // Emit updates
    Socket.emit('updateGameData', data);
    Socket.emit('gameEventMessage', message);
  }
  autoSort(cards) {
    // Puts cards in pre-defined order
    const order = ['2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
                   '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
                   '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
                   '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'];
    const newCardOrder = order.filter(cardId => cards.includes(cardId));
    return newCardOrder;
  }
  cardClick(e) {
    e.preventDefault();
    // Move card up or back flush with the rest of the hand

    const newState = Object.assign({}, this.state);
    const cardId = e.target.id.slice(5, 7) + (parseInt(e.target.id.slice(7), 10) - Math.floor((13 -
        newState.gameData.cardsLeft[newState.client.userSeat]) / 2));
    if (newState.client.upCard === cardId) {
      newState.client.upCard = '';
    } else {
      newState.client.upCard = cardId;
    }
    newState.gameData.followSuitWarning = false;
    newState.gameData.spadesBrokenWarning = false;
    this.setState(newState);
  }
  bidding(e) {
    e.preventDefault();
    // Send user bid

    // Prevent double send
    document.querySelector('#sendBid').disabled = true;

    // Get bid
    const element = document.querySelector('#bid');
    let bid = element.options[element.selectedIndex].text;

    // Set players bid and message
    const bids = {};
    bids['player' + this.state.client.userSeat] = bid;
    const message = this.state.seatedNames[this.state.client.userSeat] + ' bid ' + bid;

    // Move to next player's bid turn or next stage
    const round = this.postData(this.state.gameData.round, 'turn',
      (this.state.client.userSeat + 1) % this.state.players);
    let stage = this.state.gameData.stage;
    if (round.turn === (this.state.gameData.dealer + 1) % this.state.players) {
      stage++;
    }

    // Emit updates
    Socket.emit('updateGameData', {bids: bids, round: round, stage: stage});
    Socket.emit('gameEventMessage', message);
  }
  trump(suit) {
    // Define trump
    Socket.emit('updateGameData', {trump: suit, stage: this.state.gameData.stage + 1});
  }
  playCard() {
    // Ensure player is allowed to play the current upCard

    // Prevent double sending
    document.querySelector('#playCardButton').disabled = true;

    // Define method data
    let newState = Object.assign({}, this.state);
    const user = 'player' + newState.client.userSeat;
    const cardId = newState.client.cards[newState.client.upCard.slice(2)].id;

    // Game specific requirements
    if (this.state.game === 'Spades') {
      const onlySpadesLeft = newState.client.cards.filter(card => card.id.slice(-1) === 'S').length
        === newState.client.cards.length;
      const hasSuit = typeof(newState.client.cards.find(card =>
        card.id.slice(-1) === newState.gameData.round.suitLed)) !== 'undefined';

      if (newState.gameData.round.suitLed === '') {
        if (cardId.slice(-1) !== 'S' || newState.gameData.round.spadesBroken || onlySpadesLeft) {
          newState.gameData.round.suitLed = cardId.slice(-1);
        } else {
          newState.gameData.spadesBrokenWarning = true;
          document.querySelector('#playCardButton').disabled = false;
          this.setState({gameData: newState.gameData});
          return;
        }
      } else {
        if (cardId.slice(-1) !== newState.gameData.round.suitLed && hasSuit) {
          newState.gameData.followSuitWarning = true;
          document.querySelector('#playCardButton').disabled = false;
          this.setState({gameData: newState.gameData});
          return;
        }
      }
      if (cardId.slice(-1) === 'S' && !newState.gameData.round.spadesBroken) { 
        newState.gameData.round.spadesBroken = true; 
        Socket.emit('gameEventMessage', 'Spades have been broken');
      }
      newState.gameData.round.cardsPlayed[user] = cardId;
    }

    // Format emit
    newState.gameData.round.turn = (newState.gameData.round.turn + 1) % newState.players;
    const newCards = newState.client.cards.filter(card => card.id !== cardId);
    const newCardIds = newCards.map(card => { return card.id });
    const cards = {[user]: newCardIds}
    newState.gameData.cardsLeft[newState.client.userSeat] = newCards.length;

    // Send data to database
    Socket.emit('updateGameData', {round: newState.gameData.round, cards: cards,
      cardsLeft: newState.gameData.cardsLeft});
  }
  decideTrickWinner(newState) {
    // Pick highest ranking card of the trick
    const winnerCriteria = this.props.gameObject.gameActions.rounds.decideTrickWinner;
    let round = Object.assign({}, newState.gameData.round);
    let message = '';

    // Trump card game determinations
    if (winnerCriteria.includes('High trump suit else high lead suit')) {
      const trump = newState.gameData.trump.slice(0, 1);
      const rank = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
      const playersAndCards = newState.gameData.round.cardsPlayed;
      const cards = Object.values(playersAndCards);
      const suitLed = newState.gameData.round.suitLed;

      const winningSuit = (cards.filter(card => card.slice(-1) === trump).length > 0) ? trump : suitLed;
      const winningCard = rank.find(rank => cards.includes(rank + winningSuit)) + winningSuit;
      const winningPlayer = Object.keys(playersAndCards).find(key => playersAndCards[key] === winningCard);
      message = newState.seatedNames[winningPlayer.slice(-1)] +
        ' won with the ' + this.props.gameObject.deck.find(card => card.id === winningCard).title;

      if (this.state.game === 'Spades') {
        if (!this.isDataThere(round.scores, winningPlayer)) { round.scores[winningPlayer] = 0; }
        round.scores[winningPlayer]++;
        round.turn = parseInt(winningPlayer.slice(6), 10);
        round.suitLed = '';
      }
    }

    // Limit one user to emit trickWinnerMessage
    round.trickWinnerMessage = message;
    Socket.emit('updateGameData', {round: round});

    // Display trickWinnerMessage for 1 second then proceed to the next trick / round
    setTimeout(() => {
      round.trickDecided = true;
      Socket.emit('updateGameData', {round: round});
    }, 1000);
  }
  scoreRound(newState) {
    // Score round

    let message = '    Scores:\n';
    if (this.state.game === 'Spades') {
      const bagsDecision = newState.gameData.decided.bags === '10 = -100 Points';
      const teams = newState.gameData.decided.partners === 'Across';
      let scoreText = {player0: '', player1: '', player2: '', player3: '', team0: '', team1: '', };

      // Score each player
      [...Array(this.state.players).keys()].forEach((index) => {
        const playerIndex = 'player' + index;
        // Get score before round
        if (!this.isDataThere(newState.gameData.round.scores, playerIndex)) {
          newState.gameData.round.scores[playerIndex] = 0;
        }
        if (!this.isDataThere(newState.gameData.gameScores, playerIndex)) {
          newState.gameData.gameScores[playerIndex] = {score: 0, bags: 0};
        }
        const tricks = parseInt(newState.gameData.round.scores[playerIndex], 10);
        let score = newState.gameData.gameScores[playerIndex].score;
        let bags = newState.gameData.gameScores[playerIndex].bags;

        // Write score message before round
        scoreText[playerIndex] = score + ' Points' + (bagsDecision ? " & " + bags + ' Bags' : '');
        message += '\n' + newState.seatedNames[index] + "'s Score: " + scoreText[playerIndex] +
          '\n  Tricks: ' + tricks + ' Bid: ' + newState.gameData.bids[playerIndex];
        const bid = newState.gameData.bids[playerIndex] === 'Nil' ? 0 :
          parseInt(newState.gameData.bids[playerIndex], 10);

        // Score players' round
        if (bid === 0) {
          if (tricks === 0) {
            score += 100;
            message += '\n  Nil Bid Achieved - 100 Point Bonus';
          } else {
            score -= 100;
            message += '\n  Nil Bid Failed - 100 Point Penalty';
          }
        } else {
          if (bagsDecision) {
            score += bid * 10 * (tricks < bid ? -1 : 1);
            bags += (tricks < bid ? 0 : tricks - bid);
            if (bags >= 10 && !teams) { 
              score -= 100;
              bags -= 10;
              message += '\n  10 Bags - 100 Point Penalty';
            }
            newState.gameData.gameScores[playerIndex].bags = bags;
          } else {
            score += (tricks < bid ? bid * -10 : bid * 10 + tricks - bid);
          }
        }
        newState.gameData.gameScores[playerIndex].score = score;

        // Write updated players' score
        scoreText[playerIndex] = score + ' Points' + (bagsDecision ? " & " + bags + ' Bags' : '');
        message += '\n' + newState.seatedNames[index] + "'s New Score: " + scoreText[playerIndex] + '\n';
      });

      // Define round scores message
      if (teams) {
        let teamScore = 0;
        let bags = 0;
        let gameScores = newState.gameData.gameScores;
        [0, 1].forEach((index) => {
          const playerIndex = 'player' + index;
          const playerIndex2 = 'player' + (index + 2);
          const teamIndex = 'team' + index;

          // Add team scores together
          if (!this.isDataThere(gameScores, teamIndex)) {
            gameScores[teamIndex] = {score: 0, bags: 0};
          }
          teamScore = gameScores[playerIndex].score + gameScores[playerIndex2].score;
          bags = gameScores[playerIndex].bags + gameScores[playerIndex2].bags;
          gameScores[playerIndex].bags = 0;
          gameScores[playerIndex2].bags = 0;

          // Write team score
          scoreText[teamIndex] = teamScore + ' Points' + (bagsDecision ? ', ' +  bags  + ' Bags' : '');
          message += '\nTeam ' + newState.seatedNames[index] + ' and ' +
            newState.seatedNames[index + 2] + ':\n' + scoreText[teamIndex] + '\n';

          // 10 Bag Penalty
          if (bagsDecision && bags >= 10) {
            teamScore -= 100;
            bags -= 10;
            scoreText[teamIndex] = teamScore + ' Points, ' + bags + ' Bags';
            message += '  10 Bags - 100 Point Penalty\nNew Score: ' + scoreText[teamIndex] + '\n';
          }
          gameScores[teamIndex] = {score: teamScore, bags: bags};
        });
        newState.gameData.gameScores = gameScores;
      } else {
        // Write final Round Score
        message += '\n' + newState.seatedNames[0] + ': ' + scoreText['player0'] + '\n' +
          newState.seatedNames[1] + ': ' + scoreText['player1'] + '\n' +
          newState.seatedNames[2] + ': ' + scoreText['player2'] + '\n' +
          newState.seatedNames[3] + ': ' + scoreText['player3'];
      }
      Socket.emit('gameEventMessage', message);
    }

    // Reset gameStage back to bidding, shift dealer and turn, clear bids and round scores, and un-break spades 
    newState.gameData.stage = 2;
    newState.gameData.dealer = (newState.gameData.dealer + 1) % newState.players;
    newState.gameData.round.turn = (newState.gameData.dealer + 1) % newState.players;
    Object.keys(newState.gameData.bids).forEach(p => newState.gameData.bids[p] = '');
    Object.keys(newState.gameData.round.scores).forEach(p => newState.gameData.round.scores[p] = 0);
    newState.gameData.round.spadesBroken = false;

    return newState;
  }
  checkEndgame(newState) {
    // Check endgame

    let resetGame = false;
    let message = '';

    // Check if endgame met
    if (newState.gameData.decided.endgame.slice(-6) === 'Points') {
      const endgame = parseInt(newState.gameData.decided.endgame.slice(0, -7), 10);

      // Spades
      if (this.state.game === 'Spades') {
        const gameScores = newState.gameData.gameScores;
        const bagsDecision = (newState.gameData.decided.bags === '10 = -100 Points');

        // Endgame Variations
        if (newState.gameData.decided.partners === 'Across') {
          let winner = -1;

          // If some team met the endgame score
          if (gameScores['team0'].score >= endgame || gameScores['team1'].score >= endgame) {
            if (bagsDecision) {
              // If Partners and Bags
              if (gameScores['team0'].score === gameScores['team1'].score) {
                if (gameScores['team0'].bags === gameScores['team1'].bags) {
                  message = '\nTie Game!\nOne More Round!';
                }
                if (gameScores['team0'].bags < gameScores['team1'].bags) { winner = 0; }
                if (gameScores['team0'].bags > gameScores['team1'].bags) { winner = 1; }
              }
              if (gameScores['team0'].score < gameScores['team1'].score) { winner = 1; }
              if (gameScores['team0'].score > gameScores['team1'].score) { winner = 0; }
            } else {
              // If Partners and No Bags
              if (gameScores['team0'].score === gameScores['team1'].score) {
                message = '\nTie Game!\nOne More Round!';
              }
              if (gameScores['team0'].score > gameScores['team1'].score) { winner = 0; }
              if (gameScores['team0'].score < gameScores['team1'].score) { winner = 1; }
            }
            if (winner > -1) {
              const winningTeam = newState.seatedNames[winner] + ' and ' + newState.seatedNames[winner + 2];
              message = '\nEndgame: ' + endgame + ' Points\n\n' + winningTeam +
                ' Win!';
              resetGame = true;
            }
          }
        } else {
          
          // If some player met the endgame score
          if (gameScores['player0'].score >= endgame || gameScores['player1'].score >= endgame ||
              gameScores['player2'].score >= endgame || gameScores['player3'].score >= endgame) {
            let sortedScores = Object.keys(gameScores).map(player => { 
              return gameScores[player].score + (bagsDecision ? gameScores[player].bags : 0)});
            sortedScores = sortedScores.filter(score => score >= endgame).sort((a, b) => a - b).reverse();

            resetGame = true;
            let topScores = '';
            if (bagsDecision) {
              // If No Partners and Bags
              topScores = sortedScores.filter(score =>
                score - score % 10 === sortedScores[0] - sortedScores[0] % 10);
              if (topScores.length > 1 && topScores[topScores.length - 1] === topScores[topScores.length - 2]) {
                resetGame = false;
                message = 'Tie Game!\nOne More Round!';
              }
            } else {
              // If No Partners and No Bags
              topScores = sortedScores.filter(score => score  === sortedScores[0]);
              if (topScores.length > 1) {
                resetGame = false;
                message = '\nTie Game!\nOne More Round!';
              }
            }

            if (resetGame) {
              const winningScore = topScores[topScores.length - 1];
              const winningPlayer = newState.seatedNames[Object.keys(gameScores).find(player =>
                gameScores[player].score + gameScores[player].bags === winningScore).slice(-1)];
              message = '\nEndgame: ' + endgame + ' Points\n\n' + winningPlayer + ' Wins!';
            }

          }
        }
      }
    }

    // Send message if needed
    if (message !== '') {
      Socket.emit('gameEventMessage', message);
    }

    // Reset game to before first stage if endgame reached
    if (resetGame) {
      newState.gameData.stage = -1;
      newState.gameData.dealer = -1;
      newState.gameData.decided = {};
      newState.gameData.gameScores = {};
      newState.inGame = false;
      this.endGame();
    }

    return newState;
  }

  /*General Tools*/
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  postData(object, path, newData) {
    // Creates a new object without altering the originalObject
    const newObject = JSON.parse(JSON.stringify(object));
    let current = newObject;
    const pathArray = path.split('.');

    pathArray.forEach((key, index) => {
      if (index === pathArray.length - 1) {
        current[key] = newData;
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    })

    return newObject;
  }
  isDataThere(object, path, value) {
    // Determines if the data at the end of the path has been declared
    // or optionally is equal to the given value
    let current = object;
    const pathArray = path.split('.');

    let results = true;
    pathArray.forEach((key, index) => {
      if (!current[key]) {
        results = false;
        return;
      }
      current = current[key];
    })

    if (value && current !== value) {
      results = false;
    }

    return results;
  }


  /*


          Ideas:
          . a whos turn symbol for other players to see, to speed up current players time
          . bigger card on click before send, just make your own cards really - Kelly (like a zoom in on the card -60 upCard with printed title in a box over the card)
          . warning box generator
          . if gameplay in round is taking too long for person to respond then give them a countdown to decide by or it stands them up
          . display gameroom data table on main screen before gameroom: 
            | Game Number | Game | Players | People in room | Date Started |
            Maybe make this viewable under the two boxes, like the 5 most recent rooms created and sorted by most people in the room
            So Create Game box creates the room and displays the number to the creator
          . add sounds and animations (shuffle noise, chat message received not game event)
          . click and drag to sort cards, upload card orientation on standup
          . option to drag card to center to play card
          . maybe an indication of who's cards were left there upon standing up and leaving then returning to the room


          Non-issues:
          . only shows one card on reentering room with full seats
          . all non-users cards are backwards and seat 3 is backwards from chatroom perspective too


          Ultimately: a deck uploader and a table where you can lay cards any way you want and select game rules and variations


*/

  render() {
    const {leaveGame, gameObject} = this.props;
    const {players, seatedNames, inGame, gameStages, formSizes, gameData, chatLog} = this.state;
    const {stage, dealer, cardsLeft, allowedBids, bids, followSuitWarning, spadesBrokenWarning} = this.state.gameData;
    const {turn, suitLed, scores, trickDecided, trickWinnerMessage} = this.state.gameData.round;
    const {userSeat, seatRotation, cards, upCard, thisTricksCards, chatInputValue} = this.state.client;

    return(
      <div className='GameRoom'>
        <img
          id='gameTable'
          src={GameTable}
          alt='Octagonal Game Table' />
        <div id='table'>

          {/*Leave Button*/}
          <input
            type='button'
            id='leaveButton'
            className='font button'
            value='Leave Room'
            onClick={e => { 
              Socket.disconnect(); 
              leaveGame(e); } } />

          {/*Start Button*/}
          {(!inGame && userSeat !== 'chatRoom') ? (
            <input
              type='button'
              id='startGame'
              className='font button'
              value='Start Game'
              disabled={seatedNames.includes('')}
              onClick={e => this.startGame(e)} />) : null}

          {/*Decisions Form*/}
          {(gameStages[stage] === 'decisions' && userSeat === 0) ? (
            <form
              id='decisions'
              className='form'
              style={formSizes.decisions}>
              {Object.keys(gameObject.gameActions.decisions).map((decision, keyIndex) => { return(
                <div
                  className='font lineContainer'
                  key={keyIndex}>
                  <label className='font label'>
                    {gameObject.gameActions.decisions[keyIndex]}:
                    <select
                      id={decision}
                      className='font select'>
                      {Object.entries(gameObject.gameActions.options)[keyIndex][1].map((option, valueIndex) => { return(
                        <option
                          className='font option'
                          key={valueIndex}
                          value={option}>
                          {option}
                        </option> )})}
                    </select>
                  </label>
                  <br />
                </div> )})}
              <div id='buttonContainer'>
                <input
                  type='button'
                  id='postDecisions'
                  className='font'
                  value='Get the Cards'
                  onClick={e => this.postDecisions(e)} />
              </div>
            </form> ) : null }

          {/*Dealer Form*/}
          {(gameStages[stage] === 'deal' && userSeat === dealer) ? (
            <form
              id='dealer'
              className='form'
              style={formSizes.default}>
              <input
                type='button'
                id='shuffle'
                className='font'
                value='Shuffle'
                onClick={() => this.shuffle((gameData.deck.length > 0 ? 
                  gameData.deck : gameObject.deck.map(card => card.id)), true)} />
              <input
                type='button'
                id='deal'
                className='font'
                value='Deal'
                disabled={gameData.deck.length === 0}
                onClick={() => this.deal(gameData.deck, players)} />
            </form> ) : null }

          {/*Bidding Form*/}
          {(gameStages[stage] === 'bidding' && userSeat === turn) ? (
            <form
              id='bidding'
              className={'form' +
                (this.isDataThere(bids, 'player' + userSeat) ? ' hidden' : '')}
              style={formSizes.default}>
              <label className='font label'>
                Bid:
                <select
                  id='bid'
                  className='font'>
                  {allowedBids.map((option, index) => { return(
                    <option
                      className='font'
                      key={index}
                      value={option}>
                      {option}
                    </option> )})}
                </select>
              </label>
              <input
                type='button'
                id='sendBid'
                className='font'
                value='Send'
                onClick={e => this.bidding(e)} />
            </form> ) : null }

          {/*Your Turn Box / PlayCard Button*/}
          {(gameStages[stage] === 'rounds' && turn === userSeat && !trickDecided) ? (
            (upCard === '') ? (
              <form
                id='yourTurn'
                className='form infoBoxSmall'>
                <label
                  id='turnText'
                  className='font label infoBoxText'>
                  Your Turn
                </label>
              </form> ) : (
              <input
                type='button'
                id='playCardButton'
                className='font button onTop'
                value='Play Card'
                onClick={() => this.playCard()} /> ) ) : null}

          {/*PlayCard Images*/}
          {[...Array(players).keys()].map(seatNum => { return(
          (this.isDataThere(thisTricksCards, 'player' + seatRotation[seatNum])) ? (
            <img
              key={seatNum}
              id={'playCard' + seatNum}
              className='card'
              src={(thisTricksCards['player' + seatRotation[seatNum]]).picture}
              alt={(thisTricksCards['player' + seatRotation[seatNum]]).title}
              title={(thisTricksCards['player' + seatRotation[seatNum]]).title} />) : null )})}

          {/*Spades Broken Warning*/}
          {spadesBrokenWarning ? (
            <form
              id='spadesBrokenWarning'
              className='form infoBox'>
              <label className='font label infoBoxText'>
                {'Spades have not been broken yet'}
              </label>
            </form> ) : null}

          {/*Follow Suit Warning*/}
          {followSuitWarning ? (
            <form
              id='followSuitWarning'
              className='form infoBox'>
              <label className='font label infoBoxText'>
                {['Spades', 'Hearts', 'Clubs', 'Diamonds'].find(suit => suit.slice(0, 1) === suitLed)
                  + ' were led'}
                <br />
                {'You must follow suit'}
              </label>
            </form> ) : null}

          {/*Round Winner*/}
          {(trickWinnerMessage !== '') ? (
            <form
              id='roundWinner'
              className='form infoBox'>
              <label className='font label infoBoxText'>
                {trickWinnerMessage}
              </label>
            </form> ) : null}

          {/*Sit Buttons*/}
          {[...Array(players).keys()].map(seatNum => { return(
          (seatedNames[seatRotation[seatNum]] === '' && userSeat === 'chatRoom') ? (
            <input
              key={seatNum}
              type='button'
              id={'sitButton' + seatNum}
              className='font button'
              value='Sit Down'
              onClick={e => this.sitDown(e)} />) : null )})}

          {/*Stand Button*/}
          {userSeat !== 'chatRoom' ? (
            <input
              type='button'
              id='standButton'
              className='font button'
              value='Stand Up'
              onClick={e => this.standUp(e)} />) : null}

          {/*Player Seats 0-3*/}
          <div className='playerSeats'>
            {[...Array(players).keys()].map(seatNum => { return(
              <section
                key={seatNum}
                id={'seat' + seatNum}
                className={'player' + seatRotation[seatNum]}>
                <form
                  id={'playerBox' + seatNum}
                  className={'form playerBox' + 
                  ((seatedNames[seatRotation[seatNum]] === '') ? ' hidden' : '')}>
                  <div className='playerInfoLine'>
                    <p className='font static playerInfoText'>
                      {dealer === seatRotation[seatNum] ? 'Dealer' : ''}
                    </p>
                  </div>
                  <div className='playerInfoLine'>
                    <p className='font static playerInfoText'>
                      {seatedNames[seatRotation[seatNum]]}
                    </p>
                  </div>
                  <div className='playerInfoLine'>
                    <p className='font static playerInfoText'>
                      {(stage < 3) ? null :
                        (this.isDataThere(scores, 'player' + seatRotation[seatNum]) ? 
                        scores['player' + seatRotation[seatNum]] : 0) + '/' +
                        (this.isDataThere(bids, 'player' + seatRotation[seatNum]) ?
                        bids['player' + seatRotation[seatNum]] : 0)}
                    </p>
                  </div>
                </form>
                {(stage > 2) ? (
                  <div id={'cards' + seatNum}>
                    {[...Array(cardsLeft[seatRotation[seatNum]]).keys()].map(index => { 
                      /* for src: if seats 0-2 then only show the back of the card
                         for the seated seat 3 user show their hand once it has been dealt */
                      return(
                        <img
                          key={index}
                          id={'card-' + seatNum + '-' + (index + Math.floor((13 - cardsLeft[seatRotation[seatNum]]) / 2))}
                          className={'card' + ((upCard === (seatNum + '-' + index)) ? ' upCard' : '')}
                          src={seatNum < 3 ? gameObject.cardBack.picture :
                            (userSeat === 'chatRoom' ? gameObject.cardBack.picture : cards[index].picture)}
                          alt={seatNum < 3 ? 'Back of Card' :
                            (userSeat === 'chatRoom' ? 'Back of Card' : cards[index].title)}
                          title={seatNum < 3 ? '' : (userSeat === 'chatRoom' ? '' : cards[index].title)}
                          onClick={(seatNum === 3 && userSeat !== 'chatRoom') ?
                            (e => this.cardClick(e)) : null} />)})}
                  </div>
                ) : null} 
              </section> )})}
          </div>
        </div>

        {/*ChatLog*/}
        <div id='chatDiv'>
          <textarea
            id='chatLog'
            className='font'
            value={chatLog}
            readOnly />
          <form id='chatForm'>
            <input
              type='input'
              id='chatInput'
              className='font'
              value={chatInputValue}
              onChange={(e) => this.writeChat(e)} />
            <input
              type='submit'
              id='chatButton'
              className='font'
              value='Send'
              onClick={(e) => this.sendChat(e)} />
          </form>
        </div>
      </div>
    );
  }
}

export default GameRoom;
