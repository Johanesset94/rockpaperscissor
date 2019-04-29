/* global define, it, describe */
process.env.NODE_ENV = 'test';
import assert from 'assert';
const app = require('./../src').default;

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Running math tests', () => {
    it('should calculate 1+1=2', () => {
        assert.equal(1 + 1, 2);
    });

});

describe('Running ping test', () => {
    it('should return status 200', () => {
        chai.request(app)
            .get('/api/ping')
            .send()
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
            });
    });
});
// ==== Create game tests ====
describe('Running create game tests', () => {
    it('should create a new game', () => {
        let req = { name: 'Johan' };
        chai.request(app)
            .post('/api/games')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
            });
    });
    it('should return status 400 since no name was provided', () => {
        let req = {};
        chai.request(app)
            .post('/api/games')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(400);
            });
    });
});
// ==== Join game tests ====
describe('Running join game tests', () => {
    let gameId;
    before('Creating a new game for join game tests', () => {
        return new Promise(resolve => {
            let req = { name: 'Johan' };
            chai.request(app)
                .post('/api/games')
                .send(req)
                .end((err, res) => {
                    gameId = res.text;
                    console.log('Game is setup for join-game test with gameId %s', gameId);
                    resolve();
                });
        });
    });
    it('should not allow a player to join a game that does not exists, returning 404', () => {
        let req = { name: 'JollieSnakeborre' };
        chai.request(app)
            .post('/api/games/' + 'a' + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(404);
            });
    });
    it('should not allow a player to join a game if no name is provided, returning 400', () => {
        let req = {};
        chai.request(app)
            .post('/api/games/' + gameId + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(400);
            });
    });
    it('should not allow a player to join a game if the name is the same as the other player, returning conflict 409', () => {
        let req = { name: 'Johan' };
        chai.request(app)
            .post('/api/games/' + gameId + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(409);
            });
    });
    it('should allow a new player to join an existing game, returning 200', () => {
        let req = { name: 'JollieSnakeborre' };
        chai.request(app)
            .post('/api/games/' + gameId + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
            });
    });
    it('should not allow a new player to join an existing game if it is already full, returning 410', () => {
        let req = { name: 'Player3' };
        chai.request(app)
            .post('/api/games/' + gameId + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(410);
            });
    });
});
// ===== Make move test =====
describe('Running make move tests', () => {
    let gameId;
    const player1 = 'player1', player2 = 'player2';
    before('Creating a new game for make move tests', () => {
        return new Promise(resolve => {
            let req = { name: player1 };
            chai.request(app)
                .post('/api/games')
                .send(req)
                .end((err, res) => {
                    gameId = res.text;
                    console.log('Game is setup for make-move test with gameId %s', gameId);
                    req.name = player2;
                    chai.request(app)
                        .post('/api/games/' + gameId + '/join')
                        .send(req)
                        .end((err, res) => {
                            console.log('Both players joined game %s for make-move test', gameId);
                            resolve();
                        });
                });
        });
    });
    it('should not allow a player to make a move in a game that does not exists, returning 404', () => {
        let req = {
            name: player1,
            move: 'Rock'
        };
        chai.request(app)
            .post('/api/games/' + 'a' + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(404);
            });
    });
    it('should not allow a player which is not in the game to make a move, returning 403', () => {
        let req = {
            name: 'Johan',
            move: 'Rock'
        };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(403);
            });
    });
    it('should not allow a player to make a move that is not allowed, returning 400', () => {
        let req = {
            name: player1,
            move: 'Spock'
        };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(400);
            });
    });
    it('should allow a player to make a legal move if the player is in the game and has not yet made a move', () => {
        let req = {
            name: player1,
            move: 'Rock'
        };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
            });
    });
    it('should not allow a player to make a second move, returning 410', () => {
        let req = {
            name: player1,
            move: 'Paper'
        };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(410);
            });
    });
    it('should allow the second player to make a move after the first player did', () => {
        let req = {
            name: player2,
            move: 'Scissor'
        };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
            });
    });
});
// ==== Get game status tests
// All API calls except create a new game will also return the game status in the body.
// These tests make sure that the correct game status is returned.
describe('Running game status tests', () => {
    let gameId;
    const player1 = 'player1', player2 = 'player2';
    before('Creating a new game for game status tests', () => {
        return new Promise(resolve => {
            let req = { name: player1 };
            chai.request(app)
                .post('/api/games')
                .send(req)
                .end((err, res) => {
                    gameId = res.text;
                    console.log('Game is setup for game status test with gameId %s', gameId);
                    resolve();
                });
        });
    });
    it('should return game status of "created" before player 2 joins', () => {
        chai.request(app)
            .get('/api/games/' + gameId)
            .send()
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res.body.status).to.equal('created');
                chai.expect(res.body.player1).to.equal(player1);
            });
    });
    it('should return game status "ongoing" after both players joined', () => {
        let req = { name: player2 };
        chai.request(app)
            .post('/api/games/' + gameId + '/join')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res.body.status).to.equal('ongoing');
                chai.expect(res.body.player2).to.equal(player2);
            });
    });
    it('should return game status "ongoing" still after one player made their move, without revealing what move was made', () => {
        let req = { name: player1, move: 'rock' };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res.body.status).to.equal('ongoing');
                chai.expect(res.body['player1Move']).to.be.undefined;
                chai.expect(res.body['player2Move']).to.be.undefined;
            });
    });
    it('should return game status "finished" after both players made their move, and reveal everything of the game, also determining the correct winner', () => {
        let req = { name: player2, move: 'scissor' };
        chai.request(app)
            .post('/api/games/' + gameId + '/move')
            .send(req)
            .end((err, res) => {
                chai.expect(err).to.be.null;
                chai.expect(res.body.status).to.equal('finished');
                chai.expect(res.body['player1Move']).to.equal('rock');
                chai.expect(res.body['player2Move']).to.equal('scissor');
                chai.expect(res.body.result).to.equal(player1 + ' won');
            });
    });
});
