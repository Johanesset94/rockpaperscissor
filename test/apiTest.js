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
        let req = { };
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

describe('Running make move tests', () => {
    let gameId;
    const player1 = 'player1', player2 = 'player2';
    before('Creating a new game for join game tests', () => {
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
    it('should calculate 1+1=2', () => {
        assert.equal(1 + 1, 2);
    });

});