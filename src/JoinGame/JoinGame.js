import React, { Component } from 'react';

class JoinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameNumber: '',
      userName: ''
    };
  }

  changeGameNumber(newGameNumber) {
    this.setState({ 
      gameNumber: newGameNumber
    });
  }

  changeUserName(newUserName) {
    this.setState({ 
      userName: newUserName
    });
  }
  
  render() {
    const {joinGame} = this.props;
    const {gameNumber, userName} = this.state;

    return (
      <div className="JoinGame">
        <form>
          <fieldset>
            <legend>Join Game</legend>

            <label htmlFor="gameNumber">Game Number: </label>
            <input
              type="text"
              id="gameNumber"
              onChange={(e) => this.changeGameNumber(e.target.value)}
              value={gameNumber} />
            <br />

            <label htmlFor="userName">User Name: </label>
            <input
              type="text"
              id="userName"
              onChange={(e) => this.changeUserName(e.target.value)}
              value={userName} />
            <br />
            
            <input
              type="submit"
              value="Join"
              onClick={(e)=> joinGame(e, gameNumber, userName)} />
          </fieldset>
        </form>
      </div>
    );
  }
}

export default JoinGame;
