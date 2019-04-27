import { Router } from 'express';

const gameController = require('./../game');

export default () => {
	const api = Router();

	// Ping server
	api.get('/ping', (req, res) => { res.send('pong') });

	// Create a new game
	api.post('/games', (req, res) => { gameController.createGame(req, res) });

	// Get game status
	api.get('/games/:id', (req, res) => { gameController.getGameStatus(req, res) });

	// Join an active game
	api.post('/games/:id/join', (req, res) => { gameController.joinGame(req, res) });

	// Make a move in an active game
	api.post('/games/:id/move', (req, res) => { gameController.makeMove(req, res)});

	return api;
}
