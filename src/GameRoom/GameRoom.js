import React, { Component } from 'react';
import io from 'socket.io-client';
import GameTable from './GameTable.png';
import Games from '../games.js';
import './GameRoom.css';

let Socket = '';

class GameRoom extends Component {
  constructor (props) {
    super(props)
    this.state = {
      gameObject: Games.filter(game => game.name === this.props.game)[0],
      chatInputValue: '', // Global
      chatLog: '', // Global
      users: '', // Global
      seatedNames: ['', '', '', ''], // Global
      inGame: false, // Global
      userSeat: 'chatRoom',  // Client only
      
    };
  }

  componentDidMount() {
    // Create WebSocket between client and server
    Socket = io(this.props.serverURL);

    // Provide client data to server
    const initialData = {
      userName: '' + this.props.userName,
      gameNumber: '' + this.props.gameNumber,
      newUserObject: JSON.stringify(this.state.gameObject.newUserObject)
    };
    Socket.emit('first-contact', initialData);

    // Receive the current gameRoom state from the database to construct here
    Socket.on('gameRoomState', gameRoom => this.buildGameRoom(gameRoom));

    // Update chatLog with new messages
    Socket.on('chatLogMessage', message => this.receiveChat(message));

    // Update users list
    Socket.on('updateUserList', newUsers => this.updateUserList(newUsers));

    

  }


  buildGameRoom(gameRoom) {
    console.log(gameRoom);
    this.updateUserList(gameRoom.users);
    this.initialChatLog(gameRoom.chatLog);

  }
  updateUserList(newUsers) {
    const users = JSON.parse(newUsers);

    // Define seats by name and determine inGame status
    let seatedNames = ['', '', '', ''];
    let inGame = false;
    for (let x = 0; x < users.length; x++) {
      if ([0, 1, 2, 3].includes(users[x].seat)) {
        seatedNames[users[x].seat] = users[x].name;
      }
      if (users[x].inGame === true) {inGame = true;}
    }

    // Define client's seat
    const user = users.find(user => user.name === this.props.userName);

    this.setState({
      users: users,
      seatedNames: seatedNames,
      userSeat: user.seat,
      inGame: inGame
    })
  }


  initialChatLog(chatLog) {
    if (JSON.parse(chatLog) !== '[]') {
      let newchatLog = "";
      JSON.parse(chatLog).map(line => {
        newchatLog += line + '\n';
      });
      this.setState({
        chatLog: newchatLog
      });
    }
  }
  writeChat(e) {
    this.setState({
      chatInputValue: e.target.value
    });
  }
  sendChat(e) {
    e.preventDefault();
    Socket.emit('chatLogMessage', this.state.chatInputValue);
    this.setState({
      chatInputValue: ''
    });
  }
  receiveChat(message) {
    let newchatLog = this.state.chatLog + message + '\n';
    this.setState({
      chatLog: newchatLog
    });
    let textarea = document.getElementById('chatLog');
    textarea.scrollTop = textarea.scrollHeight;
  }


  sitDown(e) {
    e.preventDefault();
    // Post seat change to server

    const seat = parseInt(e.target.className.slice(-1), 10);
    let userInfo;

    // Either sit down where cards are waiting or at an empty seat
    let cardsWaitingCheck = this.state.users.find(user => user.name === 'Cards Waiting');
    if (typeof(cardsWaitingCheck) !== 'undefined' && cardsWaitingCheck.seat === seat) {
      Socket.emit('removeCardsWaiting', seat);
    } else {
      userInfo = this.state.users.find(user => user.name === this.props.userName);
      userInfo.seat = seat;
      Socket.emit('updateUser', userInfo);
    }
  }
  standUp(e) {
    e.preventDefault();
    // Post seat change to server

    // Saves the users cards at their seat our just stands the user up
    let userData = this.state.users.find(user => user.name === this.props.userName);
    if (userData.inGame) {
      Socket.emit('standUpInGame', userData);
    } else {
      let userNewSeat = this.state.gameObject.newUserObject
      userNewSeat.name = this.props.userName
      Socket.emit('updateUser', userNewSeat);
    }
  }


  startGame(e) {
    e.preventDefault();
    // Send a call to the server and update all the seated players' statuses
    Socket.emit('startGame');

    

    // if gameplay taking too long for person to respond then give
    // them a countdown to decide by or it stands them up
  }
  endGame() {
    // Send a call to the server and update all the seated players' statuses
    Socket.emit('endGame');



    // Make sure to do this, or all the users and cards will be saved on socket disconect
  }

  shuffle(deck) {
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

    return deck;
  }

  deal() {

  }

  render() {
    const {leaveGame, userName} = this.props;
    const {chatLog, chatInputValue, userSeat, seatedNames, inGame} = this.state;

    // Rotate the seats so the client's is at the bottom of the screen
    const rotation = [0, 1, 2, 3, 0, 1, 2];
    const seatRotation = (userSeat === 'chatRoom') ?
      rotation.slice(0, 4) : rotation.slice(userSeat, userSeat + 4);

    return(
      <div className='GameRoom'>
        {/* <p>#{gameNumber}: {game} - {players} Players</p> */}
        {/*<img
          className='gameTable'
          src={GameTable}
          alt='Octagonal Game Table' /> */}


        
        



        <div className='table'>
          <input
            type='button'
            className='leaveButton'
            value='Leave Room'
            onClick={e => { 
              Socket.disconnect(); 
              leaveGame(e); } } />


          {(inGame) ? (
            <input
              type='button'
              className='endGame'
              value='End Game'
              onClick={e => this.endGame(e)} /> )
            : ( (userSeat !== 'chatRoom') ? (
            <input
              type='button'
              className='startGame'
              value='Start Game'
              disabled={seatedNames.includes('')}
              onClick={e => this.startGame(e)} /> ) : null ) }
          





          <section className='userSeat'>
          </section>
          <section id='seat0' className={`player${seatRotation[0]}`}>
            <p className='userNameCard user0'>{seatedNames[seatRotation[0]]}</p>
          </section>
          <section id='seat1' className={`player${seatRotation[1]}`}>
            <p className='userNameCard user1'>{seatedNames[seatRotation[1]]}</p>
          </section>
          <section id='seat2' className={`player${seatRotation[2]}`}>
            <p className='userNameCard user2'>{seatedNames[seatRotation[2]]}</p>
          </section>
          <section id='seat3' className={`player${seatRotation[3]}`}>
            <p className='userNameCard user3'>{seatedNames[seatRotation[3]]}</p>
          </section>

          <img
            className='playCard0 card'
            src=''
            alt='' />
          <img
            className='playCard1 card'
            src=''
            alt='' />
          <img
            className='playCard2 card'
            src=''
            alt='' />
          <img
            className='playCard3 card'
            src=''
            alt='' />

          {(['', 'Cards Waiting'].includes(seatedNames[0])) && userSeat === 'chatRoom' ? (
            <input
              type='button'
              className='sitButton0'
              value='Sit Down'
              onClick={e => this.sitDown(e)} />) : null}
          {(['', 'Cards Waiting'].includes(seatedNames[1])) && userSeat === 'chatRoom' ? (
            <input
              type='button'
              className='sitButton1'
              value='Sit Down'
              onClick={e => this.sitDown(e)} />) : null}
          {(['', 'Cards Waiting'].includes(seatedNames[2])) && userSeat === 'chatRoom' ? (
            <input
              type='button'
              className='sitButton2'
              value='Sit Down'
              onClick={e => this.sitDown(e)} />) : null}
          {(['', 'Cards Waiting'].includes(seatedNames[3])) && userSeat === 'chatRoom' ? (
            <input
              type='button'
              className='sitButton3'
              value='Sit Down'
              onClick={e => this.sitDown(e)} />) : null}
          {userSeat !== 'chatRoom' ? (
            <input
              type='button'
              className='standButton'
              value='Stand Up'
              onClick={e => this.standUp(e)} />) : null}


          

        </div>
        

        

        <div className='chatDiv'>
          <textarea
            className='chatLog'
            id='chatLog'
            value={chatLog}
            readOnly />
          <form className='chatForm'>
            <input
              type='input'
              className='chatInput'
              value={chatInputValue}
              onChange={(e) => this.writeChat(e)} />
            <input
              type='submit'
              className='chatButton'
              value='Send'
              onClick={(e) => this.sendChat(e)} />
          </form>
        </div>
      </div>
    );
  }

  // render() {
  //   const game = Games.find(item => item.name === this.props.game);
  //   const {leaveGame, gameNumber, players} = this.props;

  //   console.log(game);
    
  //   let newDeck = this.shuffle(game.deck);
  //   console.log(newDeck[5]);

  //   let playerSeats = [];
  //   for (let x = 0; x < players; x++) {
  //     playerSeats.push(
  //       <input
  //         key={x}
  //         type='button'
  //         className={'seat' + (x + 1)}
  //         value={'Seat ' + (x + 1)} />
  //     );
  //   }

  //   let dealUntil = game.deal === 'whole' ? game.deck.length : game.deal * players;
  //   let hands = [];
  //   for (let x = 0; x < dealUntil; x += players) {
  //     for (let y = 0; y < players; y++) {
  //       if (hands[y] === undefined) { hands[y] = []; }
  //       if (x + y < dealUntil) { hands[y].push(newDeck[x + y]); }
  //     }
  //   }
    
  //   return (
  //     <div className="GameRoom">
  //       <p>{newDeck.map(item => item.id).join(", ")}</p>

  //       <p>p1: {hands[0].map(item => item.id).join(", ")}</p>
  //       <div>p1: {hands[0].map(item => 
  //         <img
  //           className='card'
  //           src={item.picture}
  //           alt={item.title}
  //           title={item.title} />)}
  //       </div>

  //       <p>p2: {hands[1].map(item => item.id).join(", ")}</p>
  //       <div>p2: {hands[1].map(item => 
  //         <img
  //           className='card'
  //           src={item.picture}
  //           alt={item.title}
  //           title={item.title} />)}
  //       </div>
  //     </div>
  //   );
  // }
}

export default GameRoom;
