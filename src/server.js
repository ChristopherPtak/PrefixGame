
const fs = require('fs');
const path = require('path');

const Express = require('express');
const WebSockets = require('ws');
const ExpressWS = require('express-ws');


/*
 * Set up game logic
 */

const GameData = JSON.parse(fs.readFileSync('static/prefixes.json'));

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrefix() {
  return getRandomElement(Object.keys(GameData));
}


class Game {
  constructor() {
    this.prefix = getRandomPrefix();
    this.words = new Set(GameData[this.prefix]);

    this.wordsGuessed = 0;
    this.wordsTotal = this.words.size;

    this.guessed = [];
    this.unguessed = [];
    this.finished = false;
  }

  guess(word) {
    if (this.finished === false) {
      const normalized = word.trim().toLowerCase();
      if (this.words.has(normalized) &&
          (! this.guessed.includes(normalized))) {
        this.guessed.push(normalized);
        this.wordsGuessed = this.guessed.length;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getState() {
    return {
      prefix: this.prefix,
      wordsGuessed: this.wordsGuessed,
      wordsTotal: this.wordsTotal,
      guessed: this.guessed,
      unguessed: this.unguessed
    };
  }

  getUnguessed() {
    let unguessed = [];
    for (const word of this.words) {
      if (! this.guessed.includes(word)) {
        unguessed.push(word);
      }
    }
    return unguessed;
  }

  getHint() {
    if (this.finished) {
      return null;
    }

    const guessed = this.guessed;
    const unguessed = this.getUnguessed();

    function sharedPrefixLength(wordA, wordB) {
      if (wordB.length > wordA.length) {
        [wordA, wordB] = [wordB, wordA];
      }
      for (let i = 0; i < wordA.length; ++i) {
        if (wordA[i] != wordB[i]) {
          return i;
        }
      }
      return wordA.length;
    }

    function longestSharedPrefix(word) {
      let longest = 0;
      for (const other of guessed) {
        if (other === word) {
          continue;
        }
        let length = sharedPrefixLength(word, other);
        if (length > longest) {
          longest = length;
        }
      }
      return longest;
    }

    let hints = [];

    for (const word of unguessed) {
      const sharedPrefix = longestSharedPrefix(word);
      if (sharedPrefix + 2 >= word.length) {
        continue;
      }

      const hint = word.substr(0, sharedPrefix + 1);
      if (this.words.has(hint)) {
        continue;
      }

      hints.push(hint);
    }

    if (hints.length === 0) {
      return null;
    } else {
      return getRandomElement(hints);
    }
  }

  finish() {
    this.finished = true;
    this.unguessed = this.getUnguessed();
  }
};

let game = new Game();

/*
 * Set up server to interact with clients
 */

const PORT = 8000;
const app = Express();

app.use(Express.static('static'));

ExpressWS(app);

const clients = new Set();

function sendToAllClients(object) {
  clients.forEach(ws => {
    ws.send(JSON.stringify(object));
  });
}

app.ws('/ws', (ws, req) => {
  clients.add(ws);

  function sendToClient(object) {
    ws.send(JSON.stringify(object))
  }

  sendToClient(game.getState());

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.guess !== undefined) {
      const word = data.guess;
      if (game.guess(word)) {
        sendToAllClients({
          wordsGuessed: game.wordsGuessed,
          newGuess: word
        });
      }
    }

    if (data.showHint !== undefined) {
      const hint = game.getHint();
      if (hint !== null) {
        sendToClient({hint: game.getHint()});
      }
    }

    if (data.showWords !== undefined) {
      game.finish();
      sendToAllClients(game.getState());
    }

    if (data.newPrefix !== undefined) {
      game = new Game();
      sendToAllClients(game.getState());
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const server = app.listen(PORT);

// Handle SIGTERM gracefully
process.on('SIGTERM', () => server.close());

