let board = [];

let game = document.getElementById(BWProperties.namespace + "_tictactoe_board");

let currentPlayer = 'player1';

let isGameActive = true;

let player1Piece = '<i class="fas fa-times fa-3x"></i>';

let player2Piece = '<i class="far fa-circle fa-3x"></i>';

let player_1_id = null;

let player_2_id = null;

let event_user_moved = BWProperties.namespace + '_event_player_moved';

let event_set_player = BWProperties.namespace + '_event_set_play';

let event_reset_game = BWProperties.namespace + '_event_reset_game';

function createBoard() {

    game.innerHTML = '';
    board = [];

    for (var i = 0; i < 3; i++) {
        if (board[i] == undefined) {
            board[i] = [];
        }

        let row = document.createElement('div');

        row.setAttribute('class', `row`);

        for (var j = 0; j < 3; j++) {

            if (board[i][j] == undefined) {
                let col = document.createElement('div');

                col.setAttribute('id', `${i}-${j}`);
                col.setAttribute('class', `col border text-center board-piece align-middle align-text-middle align-items-center justify-content-center`);
                col.setAttribute('onclick', `${BWProperties.namespace}.placePiece(${i}, ${j})`);

                board[i][j] = col;

                row.appendChild(col);
            }
        } //end for j

        game.appendChild(row);
    } //end for i

    setParticipants();

} //end createBoard

function setParticipants() {

    BWAPI.get('/events/' + BWProperties.event_id + '/getParticipants').then(response => {

        if (response.status == 'success') {

            response.data.forEach(value => {

                addParticipantToLists(value.account);

                //Set The Currently Select Player for Player 1
                BWState.get('player_1_id').then(response => {

                    if (response.status == 'success' && response.data.state) {
                        setPlayer1AsPariticapant(response.data.state);
                    }

                });

                //Set The Currently Select Player for Player 2
                BWState.get('player_2_id').then(response => {

                    if (response.status == 'success' && response.data.state) {
                        setPlayer2AsPariticapant(response.data.state)
                    }
                });

            });

        }
    });
}

function addParticipantToLists(account) {

    //Player 1
    let optionExists = ($('#' + BWProperties.namespace + '_player-1-list option[value=' + account.id + ']').length > 0);

    if (!optionExists) {
        $('#' + BWProperties.namespace + '_player-1-list').append("<option value='" + account.id + "'>" + account.first_name + ' ' + account.first_name + "</option>");
    }

    //Player 2
    optionExists = ($('#' + BWProperties.namespace + '_player-2-list option[value=' + account.id + ']').length > 0);

    if (!optionExists) {
        $('#' + BWProperties.namespace + '_player-2-list').append("<option value='" + account.id + "'>" + account.first_name + ' ' + account.first_name + "</option>");
    }
}

function removeParticipant(account) {
    $("#" + BWProperties.namespace + "_player-1-list option[value='" + account.id + "']").remove();

    $("#" + BWProperties.namespace + "_player-2-list option[value='" + account.id + "']").remove();
}

function setPlayer1AsPariticapant(id) {
    $('#' + BWProperties.namespace + '_player-1-list').val(id);

    player_1_id = id;
  
  	BWAPI.get('/accounts/' + id).then(response => {
      	
      	if(response.status == 'success'){
          	$('#' + BWProperties.namespace + '_player_1_name').html(response.data.first_name + ' ' + response.data.last_name);
        }
    });
}

function setPlayer2AsPariticapant(id) {

    $('#' + BWProperties.namespace + '_player-2-list').val(id);

    player_2_id = id;
  
  	BWAPI.get('/accounts/' + id).then(response => {
      	
      	if(response.status == 'success'){
          	$('#' + BWProperties.namespace + '_player_2_name').html(response.data.first_name + ' ' + response.data.last_name);
        }
    });
}

function setPlayer1(player_1_id) {

    if (!player_1_id) {
        player_1_id = $('#' + BWProperties.namespace + '_player-1-list').find(":selected").val();
    }

    BWState.set('player_1_id', player_1_id);

    BWEvents.publish(event_set_player, {
        player: 'player1',
        id: player_1_id
    });
  
  	setPlayer1AsPariticapant(player_1_id);
}

function setPlayer2(player_2_id) {

    if (!player_2_id) {
        player_2_id = $('#' + BWProperties.namespace + '_player-2-list').find(":selected").val();
    }

    BWState.set('player_2_id', player_2_id);

    BWEvents.publish(event_set_player, {
        player: 'player2',
        id: player_2_id
    });
  
  	setPlayer2AsPariticapant(player_2_id);
}

function placePiece(x, y) {

    if (!player_1_id) {
        alert("Please set the who Player 1 is");
    } else if (!player_2_id) {
        alert("Please set the who Player 2 is");
    } else if (currentPlayer == 'player1' && player_1_id != BWProperties.user.account.id) {
        alert("You are not the current player 1 and cannot make a move.");
    } else if (currentPlayer == 'player2' && player_2_id != BWProperties.user.account.id) {
        alert("You are not the current player 2 and cannot make a move.");
    } else if (board[x][y].innerHTML != '') {
        alert("This board space already occupied.");
    } else if (isGameActive) {

        let currentPiece = (currentPlayer == 'player1') ? player1Piece : player2Piece;

        setBoardPiece(x, y, currentPiece);

        BWEvents.publish(event_user_moved, {
            x: x,
            y: y,
            piece: currentPiece,
            player: currentPlayer
        });

        checkWin(x, y);

        let activePlayer = (currentPlayer == 'player1') ? 'player2' : 'player1';

        setActivePlayer(activePlayer);

        saveGameState();

    } else {
        alert("You must start a new game");
    }
}

function checkWin(x, y) {

    if ((board[x][y].innerHTML != '' && board[x + 1] !== undefined && board[x + 2] !== undefined) && (board[x + 1][y] !== undefined && board[x + 1][y].innerHTML && board[x][y].innerHTML == board[x + 1][y].innerHTML) && (board[x + 2][y] !== undefined && board[x + 2][y].innerHTML && board[x + 1][y].innerHTML == board[x + 2][y].innerHTML)) {
        declareWinner();
    } else if ((board[x][y].innerHTML != '' && board[x - 1] !== undefined && board[x + 1] !== undefined) && (board[x + 1][y] !== undefined && board[x + 1][y].innerHTML && board[x][y].innerHTML == board[x + 1][y].innerHTML) && (board[x - 1][y] !== undefined && board[x -1][y].innerHTML && board[x -1][y].innerHTML == board[x][y].innerHTML)) {
        declareWinner();
    } else if ((board[x][y].innerHTML != '' && board[x - 1] !== undefined && board[x - 2] !== undefined) && (board[x - 1][y] !== undefined && board[x - 1][y].innerHTML && board[x][y].innerHTML == board[x - 1][y].innerHTML) && (board[x - 2][y] !== undefined && board[x - 2][y].innerHTML && board[x - 1][y].innerHTML == board[x - 2][y].innerHTML)) {
        declareWinner();
    } else if (board[x][y].innerHTML != '' && (board[x][y + 1] !== undefined && board[x][y + 1].innerHTML && board[x][y + 1].innerHTML == board[x][y].innerHTML) && (board[x][y + 2] !== undefined && board[x][y + 2].innerHTML && board[x][y + 2].innerHTML == board[x][y + 1].innerHTML)) {
        declareWinner();
    } else if (board[x][y].innerHTML != '' && (board[x][y - 1] !== undefined && board[x][y - 1].innerHTML && board[x][y - 1].innerHTML == board[x][y].innerHTML) && (board[x][y - 2] !== undefined && board[x][y - 2].innerHTML && board[x][y - 2].innerHTML == board[x][y - 1].innerHTML)) {
        declareWinner();
    } else if (board[x][y].innerHTML != '' && (board[x][y - 1] !== undefined && board[x][y - 1].innerHTML && board[x][y - 1].innerHTML == board[x][y].innerHTML) && (board[x][y +1] !== undefined && board[x][y + 1].innerHTML && board[x][y + 1].innerHTML == board[x][y].innerHTML)) {
        declareWinner();
    } else if ((board[x][y].innerHTML != '' && board[x + 1] !== undefined && board[x + 2] !== undefined) && (board[x + 1][y + 1] !== undefined && board[x + 1][y + 1].innerHTML && board[x + 1][y + 1].innerHTML == board[x][y].innerHTML) && (board[x + 2][y + 2] !== undefined && board[x + 2][y + 2].innerHTML && board[x + 2][y + 2].innerHTML == board[x + 1][y + 1].innerHTML)) {
        declareWinner();
    } else if ((board[x][y].innerHTML != '' && board[x - 1] !== undefined && board[x - 2] !== undefined) && (board[x - 1][y - 1] !== undefined && board[x - 1][y - 1].innerHTML && board[x - 1][y - 1].innerHTML == board[x][y].innerHTML) && (board[x - 2][y - 2] !== undefined && board[x - 2][y - 2].innerHTML && board[x - 2][y - 2].innerHTML == board[x - 1][y - 1].innerHTML)) {
        declareWinner();
    } else if ((board[x][y].innerHTML != '' && board[x - 1] !== undefined && board[x +1] !== undefined) && (board[x - 1][y - 1] !== undefined && board[x - 1][y - 1].innerHTML && board[x - 1][y - 1].innerHTML == board[x][y].innerHTML) && (board[x +1][y +1] !== undefined && board[x +1][y + 1].innerHTML && board[x +1][y +1].innerHTML == board[x][y].innerHTML)) {
        declareWinner();
    }

}

function setBoardPiece(x, y, piece) {
    board[x][y].innerHTML = piece;
}

function setActivePlayer(player) {

    currentPlayer = player;

    if (player == 'player1') {
        $('#' + BWProperties.namespace + '_current_player').html("Player 1");
    } else if (player == 'player2') {
        $('#' + BWProperties.namespace + '_current_player').html("Player 2");
    }
}

function declareWinner() {

    isGameActive = false;

    let message = ' wins! Restart the game.';

    if (currentPlayer == 'player1') {
        message = 'Player 1 ' + message;
    } else if (currentPlayer == 'player2') {
        message = 'Player 2 ' + message;
    }

    alert(message);
}

function resetGame() {
    isGameActive = true;
    BWEvents.publish(event_reset_game, {});
    saveGameState();
}

function saveGameState() {

    let boardData = [];

    for (let i = 0; i < board.length; i++) {
      
        if (!boardData[i]) {
            boardData[i] = [];
        }

        for (let j = 0; j < board[i].length; j++) {

            boardData[i][j] = board[i][j].innerHTML;
        } //end for j

    } // endfor i

    let state = {
        board: boardData,
        currentPlayer: currentPlayer,
        isGameActive: isGameActive,
        player_1_id: player_1_id,
        player_2_id: player_2_id
    };

    BWState.set('game', state);
}

function loadGameState() {

    BWState.get('game').then(function(response) {
       
        if (response.status == 'success' && response.data && response.data.state) {
            
            if (response.data.state.board) {
                
                for (let i = 0; i < response.data.state.board.length; i++) {
                  
                    for (let j = 0; j < response.data.state.board[i].length; j++) {
                      
                        if (response.data.state.board[i][j]) {
                            board[i][j].innerHTML = response.data.state.board[i][j];
                        }

                    } //end for j

                } // endfor i
            }

            setActivePlayer(response.data.state.currentPlayer);
			
          	setPlayer1AsPariticapant(response.data.state.player_1_id);
          	setPlayer2AsPariticapant(response.data.state.player_2_id);
        }
    });

}

BWEvents.subscribe(event_user_moved, 'listener_1', function(response) {

    setBoardPiece(response.x, response.y, response.piece);

    if (isGameActive) {
        checkWin(response.x, response.y);
    }

    let switchPlayer = (response.player == 'player1') ? 'player2' : 'player1';

    setActivePlayer(switchPlayer);


});

BWEvents.subscribe(event_set_player, BWProperties.namespace + '_listener_1', function(response) {

    if (response.player == 'player1') {
        setPlayer1AsPariticapant(response.id);
    } else if (response.player == 'player2') {
        setPlayer2AsPariticapant(response.id);
    }
});

BWEvents.subscribe('user_joined', BWProperties.namespace + '_listener_1', function(response) {
    addParticipantToLists(response.account);
});

BWEvents.subscribe(event_reset_game, BWProperties.namespace + '_listener_1', function(response) {
    isGameActive = true;
    createBoard();
});

BWEvents.subscribe('user_left', BWProperties.namespace + '_listener_1', function(response) {
    removeParticipant(response.account);
});

createBoard();
loadGameState();

this.setPlayer1 = setPlayer1;
this.setPlayer2 = setPlayer2;
this.placePiece = placePiece;
this.resetGame = resetGame;
