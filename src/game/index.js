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
        // Always allow anyone to see who plays
        let status = {
            gameId: req.params.id,
            player1: game.player1,
            player2: game.player2
        }
        // If both players made their move, that means that game is finished
        if (game.player1move != undefined && game.player2move != undefined) {

        }
        res.json(status);
    }
}

/**
 * Function that will let player 2 join a game.
 * @param {*} req http request containing id of game and a body with the name of player 2
 * @param {*} res 404 if no game with id, 410 if game already have a second player, 409 if there is a name conflict and 200 if player successfully joined the game
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
        games[req.params.id].status = 'In progress';
        res.status(200).json(games[req.params.id]);
    }
}

export function makeMove(req, res) {
    if (games[req.params.id] == undefined) {
        res.status(404).send('The game could not be found. Make sure the id you entered is correct. Id provided: ' + req.params.id);
    } else if ( !(games[req.params.id].player1 === req.body.name || games[req.params.id].player2 === req.body.name) ) {
        res.status(403).send('You are not participating in this game of Rock-paper-scrissor! Please create a new game.');
    } else if (!(legalMoves.indexOf(req.body.move.toLowerCase())>-1)) {
        res.status(400).send('The move you tried to make is not allowed. Please use "rock", "paper" or "scissor".');
    } else {
        let playerMove;
        if(games[req.params.id].player1 === req.body.name){
            playerMove = 'player1Move';
        } else {
            playerMove = 'player2Move';
        }

        if(games[req.params.id][playerMove] != undefined){
            res.status(410).send('You have already made your move.');
        } else {
            games[req.params.id][playerMove] = req.body.move.toLowerCase();
            res.status(200).json(games[req.params.id]);
        }
    }
}