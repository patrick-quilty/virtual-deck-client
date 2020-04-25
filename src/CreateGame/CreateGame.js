import React, { Component } from 'react';
import Games from '../games.js';

class CreateGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: Games[0].name,
      players: Games[0].players[0]
    };
    this.changeGame = this.changeGame.bind(this);
    this.changePlayers = this.changePlayers.bind(this);
  }

  changeGame(newGame) {
    this.setState({ 
      game: newGame,
      players: Games.find(item => item.name === newGame).players[0]
    });
  }

  changePlayers(newPlayers) {
    this.setState({ 
      players: parseInt(newPlayers, 10)
    });
  }

  render() {
    const {createGame} = this.props;
    const {game, players} = this.state;
    
    return (
      <div className="CreateGame">
        <form>
          <fieldset>
            <legend>Create Game</legend>

            <label htmlFor="game"> Game: </label>
            <select
              id="game"
              onChange={(e) => this.changeGame(e.target.value)}
              value={game}>
              {Games.map((x, y) => 
                <option key={y}>{x.name}</option>)}
            </select>
            <br/>

            <label htmlFor="players">Players: </label>
            <select
              id="players"
              onChange={(e) => this.changePlayers(e.target.value)}
              value={players}>
              {Games
                .find(item => item.name === game)
                .players
                .map((x, y) => 
                  <option key={y}>{x}</option>)}
            </select>
            <br/>
            
            <input
              type="submit"
              value="Create"
              onClick={(e)=> createGame(e, game, players)} />
          </fieldset>
        </form>
      </div>
    );
  }
}

export default CreateGame;
