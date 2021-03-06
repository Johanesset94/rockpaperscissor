/**
 * Module that keeps track of ongoing rock-paper-scissor games and a set of functions 
 * to allow creating, joining and making moves in games.
 */

const games = {}; // 'Map' of games
let idCounter = 0; // Counter that is incremented
const legalMoves = ['rock', 'paper', 'scissor'];
/**
 * Creates a new game of rock paper scissor.
 * @param {*} req http request which must contain body containing json object with name.
 * @param {*} res http response with the game id if game was succesfully created, but status 400 if no name was provided.
 */
export function createGame(req, res) {
    if (req.body.name == undefined) {
        res.status(400).send('Please provide a name in the body. Example: {"name":"Johan"}');
    } else {
        let gameId = idCounter++;
        let game = {
            status: 'created',
            player1: req.body.name
        };
        games[gameId] = game;
        res.status(200).send(gameId.toString());
    }
}

/**
 * Get the current status of a game. If both players made their move, the game result is presented.
 * @param {*} req 
 * @param {*} res 
 */
export function getGameStatus(req, res) {
    let game = games[req.params.id]
    if (game == undefined) {
        res.status(404).send('The game could not be found. Make sure the id you entered is correct. Id provided: ' + req.params.id);
    } else {
        // If both players havent sent their moves yet we only reveal status of game and players
        let restrictedGame = {
            status: game.status,
            player1: game.player1,
            player2: game.player2
        };
        switch (game.status) {            
            case 'created':
            case 'ongoing':
                res.status(200).json(restrictedGame);
                break;
            // We reveal everything if game is finished
            case 'finished':
                res.status(200).json(game);
                break;
        }

    }
}

/**
 * Function that will let player 2 join a game.
 * @param {*} req http request containing id of game and a body with the name of player 2
 * @param {*} res 404 if no game with id, 410 if game already have a second player, 409 if there is a name conflict and 200 with game status if player successfully joined
 */
export function joinGame(req, res) {
    if (games[req.params.id] == undefined) {
        res.status(404).send('The game could not be found. Make sure the id you entered is correct. Id provided: ' + req.params.id);
    } else if (req.body.name == undefined) {
        res.status(400).send('Please provice a name to join the game. Example: {"name":"Johan"}')
    } else if (games[req.params.id].player2 != undefined) {
        res.status(410).send('The game you tried to join is already full. Sorry.');
    } else if (games[req.params.id].player1 === req.body.name) {
        // If there is a name conflict we will not know who made which move!
        res.status(409).send('Player 1 is named ' + req.body.name + '. Please choose another name!');
    } else {
        games[req.params.id].player2 = req.body.name;
        games[req.params.id].status = 'ongoing';
        getGameStatus(req, res);
    }
}
/**
 * Allows the players to make their moves.
 * @param {} req Http request with body containing player name and player move. Game id should be provided as parameter.
 * @param {*} res 404 if no game found, 400 if only one player in game or move is illegal, 410 if game is already finished or player already made their move, 403 if player is not in this game, but otherwise send game status with 200
 */
export function makeMove(req, res) {
    if (games[req.params.id] == undefined) {
        res.status(404).send('The game could not be found. Make sure the id you entered is correct. Id provided: ' + req.params.id);
    } else if (games[req.params.id].status === 'created'){
        res.status(400).send('Your opponent have not joined the game yet. Please wait');
    } else if (games[req.params.id].status === 'finished'){
        res.status(410).send('This game is already finished. Please create a new one to play again.');
    } else if (!(games[req.params.id].player1 === req.body.name || games[req.params.id].player2 === req.body.name)) {
        res.status(403).send('You are not participating in this game of Rock-paper-scrissor! Please create a new game.');
    } else if (!(legalMoves.indexOf(req.body.move.toLowerCase()) > -1)) {
        res.status(400).send('The move you tried to make is not allowed. Please use "rock", "paper" or "scissor".');
    } else {
        let playerMove;
        if (games[req.params.id].player1 === req.body.name) {
            playerMove = 'player1Move';
        } else {
            playerMove = 'player2Move';
        }

        if (games[req.params.id][playerMove] != undefined) {
            res.status(410).send('You have already made your move.');
        } else {
            games[req.params.id][playerMove] = req.body.move.toLowerCase();
            if (games[req.params.id]['player1Move'] != undefined && games[req.params.id]['player2Move'] != undefined) {
                decideWinner(req.params.id);
            }
            getGameStatus(req, res);
        }
    }
}
/**
 * Decides the winner of a finisihed game
 * @param {} id id of game to be decided
 */
function decideWinner(id) {
    games[id].status = 'finished';
    if (games[id]['player1Move'] === games[id]['player2Move']) {
        games[id]['result'] = 'draw';
    } else {
        games[id]['result'] = games[id].player2 + ' won';
        switch (games[id]['player1Move']) {
            case 'rock':
                if (games[id]['player2Move'] === 'scissor') {
                    games[id]['result'] = games[id].player1 + ' won';
                }
                break;
            case 'paper':
                if (games[id]['player2Move'] === 'rock') {
                    games[id]['result'] = games[id].player1 + ' won';
                }
                break;
            case 'scissor':
                if (games[id]['player2Move'] === 'paper') {
                    games[id]['result'] = games[id].player1 + ' won';
                }
                break;
        }
    }
}