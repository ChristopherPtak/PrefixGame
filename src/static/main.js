
/*
 * Objects containing page elements
 */

const elements = {
  prefix:       document.getElementById('prefix-field'),
  wordsGuessed: document.getElementById('words-guessed'),
  wordsTotal:   document.getElementById('words-total'),
  guessed:      document.getElementById('guessed'),
  unguessed:    document.getElementById('unguessed')
};

const forms = {
  guess: document.getElementById('guess-form')
};

const fields = {
  guess: forms.guess.guess
};

const buttons = {
  showHint:  document.getElementById('show-hint'),
  showWords: document.getElementById('show-remaining-words'),
  newPrefix: document.getElementById('new-prefix')
};


/*
 * Functions for manipulating page elements
 */

function htmlClearList(list) {
    list.replaceChildren();
}

function htmlAppendToList(list, item, isItalic) {
    const element = document.createElement('li');
    if (isItalic) {
        const italic = document.createElement('i');
        italic.textContent = item;
        element.appendChild(italic);
    } else {
        element.textContent = item;
    }
    list.appendChild(element);
}


/*
 * WebSocket connection
 */

const socketPath = location.pathname + '/ws' + location.search;
const socket = new WebSocket('ws://' + location.host + socketPath);

socket.onmessage = (message) => {
  const data = JSON.parse(message.data);

  if (data.prefix !== undefined) {
    elements.prefix.textContent = data.prefix;
  }

  if (data.wordsGuessed !== undefined) {
    elements.wordsGuessed.textContent = data.wordsGuessed;
  }

  if (data.wordsTotal !== undefined) {
    elements.wordsTotal.textContent = data.wordsTotal;
  }

  if (data.guessed !== undefined || data.unguessed !== undefined) {
    htmlClearList(elements.guessed);
  }

  if (data.guessed !== undefined) {
    for (const guess of data.guessed) {
      htmlAppendToList(elements.guessed, guess, false);
    }
  }

  if (data.unguessed !== undefined) {
    for (const guess of data.unguessed) {
      htmlAppendToList(elements.guessed, guess, true);
    }
  }

  if (data.newGuess !== undefined) {
    htmlAppendToList(elements.guessed, data.newGuess, false);
  }

  if (data.hint !== undefined) {
    fields.guess.value = data.hint;
  }
};

/*
 * Set up page events
 */

forms.guess.onsubmit = e => {
  e.preventDefault();
  socket.send(JSON.stringify({guess: fields.guess.value}));
  fields.guess.value = '';
};

buttons.showHint.onclick = e => {
  socket.send(JSON.stringify({showHint: true}));
};

buttons.showWords.onclick = e => {
  socket.send(JSON.stringify({showWords: true}));
};

buttons.newPrefix.onclick = e => {
  socket.send(JSON.stringify({newPrefix: true}));
};

