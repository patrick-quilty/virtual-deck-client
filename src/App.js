import React, { Component } from 'react';
import './App.css';
import Games from './games.js';
import CreateGame from './CreateGame/CreateGame.js';
import JoinGame from './JoinGame/JoinGame.js';
import GameRoom from './GameRoom/GameRoom.js';

const serverURL = 'https://desolate-woodland-08731.herokuapp.com';

function getGameNumbers() {
  return fetch(serverURL + '/games')
    .then(res => res.json())
    .then(data => data.games)
    .catch(err => console.log(err))
}

function postNewGameNumber(newGameNumber, game, players, gameData) {
  return fetch(serverURL + '/newGame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameNumber: newGameNumber,
      game: game,
      players: players,
      gameData: gameData
    })
  })
    .then(res => res.json())
    .then(data => data.record)
    .catch(err => console.log(err))
}

function getGameRoomData(gameNumber) {
  return fetch(serverURL + '/games/' + gameNumber)
    .then(res => res.json())
    .then(data => data.data)
    .catch(err => console.log(err))
}

function postNewUser(gameNumber, newUserName, gameName) {
  const newUserObject = Games.filter(game => game.name === gameName)[0].newUserObject;
  return fetch(serverURL + '/newUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameNumber: gameNumber,
      userName: newUserName,
      newUserObject: JSON.stringify(newUserObject)
    })
  })
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameNumber: '',
      game: '',
      players: '',
      gameObject: '',
      createError: false,
      gameCreated: false,
      userName: '',
      joinError: false,
      inGame: false
    };
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
  }

  async createGame(e, game, players) {
    // Adds a new game to the database
    e.preventDefault();

    // Gets the current gameNumbers
    const gameNumberList = await getGameNumbers();

    // Picks an unused gameNumber
    let unused = true;
    let newGameNumber = -1;
    do {
      newGameNumber = randomIntFromInterval(1000, 9999);
      unused = !gameNumberList.includes(newGameNumber);
    } while(!unused);

    // Sends the new gameNumber to the server which adds a new game record to the database
    const gameData = JSON.stringify(Games.find(gameObject => gameObject.name === game).gameData);
    const res = await postNewGameNumber(newGameNumber, game, players, gameData);

    // If successful then update the state
    if ('' + res === '' + newGameNumber) {
      this.setState({
        gameNumber: newGameNumber,
        game: game,
        players: players,
        createError: false,
        gameCreated: true
      });
    } else {
      this.setState({
        createError: res
      })
    }
  }

  async joinGame(e, gameNumber, userName) {
    // Check if gameNumber exists and if so then enter the GameRoom as the new user
    e.preventDefault();
    document.querySelector('.joinButton').disabled = true;

    // Gets all the data for the requested game
    const gameRoomData = await getGameRoomData(gameNumber);
    const gameObject = Games.find(game => game.name === gameRoomData.game);

    // If requested game does not exist or userName is blank then display error
    if (gameNumber === '' || !gameNumber.trim() || gameRoomData === 'Game Number Not Found' ||
          userName === '' || !userName.trim()) {
      document.querySelector('.joinButton').disabled = false;
      this.setState({
        joinError: true
      })
      return;
    }

    // If userName is used then display error
    userName = userName.slice(0, 15);
    if (gameRoomData.users !== '[]') {
      const userList = JSON.parse(gameRoomData.users).map(user => user.name);
      if (userList.includes(userName)) {
        document.querySelector('.joinButton').disabled = false;
        this.setState({
          joinError: true
        })
        return;
      }
    }

    // Post new user to the database
    const posted = await postNewUser(gameNumber, userName, gameRoomData.game);
    if (posted.status !== 200) {
      document.querySelector('.joinButton').disabled = false;
      this.setState({
        joinError: true
      })
      return;
    }

    // Update state to enter GameRoom
    this.setState({
      gameNumber: gameNumber,
      gameObject: gameObject,
      userName: userName,
      createError: false,
      gameCreated: false,
      joinError: false,
      inGame: true
    });
  }

  async leaveGame(e) {
    e.preventDefault();
    // Exits the gameRoom and resets the main page

    this.setState({
      gameNumber: '',
      game: '',
      players: '',
      createError: false,
      gameCreated: false,
      userName: '',
      joinError: false,
      inGame: false,
    });
  }

  render() {
    const {gameNumber, game, players, gameObject, createError, gameCreated, userName, joinError, inGame} = this.state;

    return (
      <div className='App'>
        {inGame ? null :
          <CreateGame
            createGame={this.createGame} />}
        {inGame ? null : 
          <JoinGame
            joinGame={this.joinGame} />}

        {!createError ? null :
          <p>Error: {createError}</p>}

        {!gameCreated ? null :
          <p>Game Created: #{gameNumber}: {game} - {players} Players</p>}

        {!joinError ? null :
          <p>Ensure Game Number is correct and User Name is not blank or taken</p>}
        
        {!inGame ? null :
          <GameRoom
            serverURL={serverURL}
            leaveGame={this.leaveGame}
            gameNumber={gameNumber}
            gameObject={gameObject}
            userName={userName} />}
      </div>
    );
  }
}

export default App;
