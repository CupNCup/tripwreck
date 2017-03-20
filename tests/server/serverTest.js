//Database setup
process.env.DB_ENV ='test';
const knex = require('../../database/db');

//Server setup
process.env.SERVER_PORT=3000;
const server = require('../../server/server.js');
const supertest = require('supertest');
const request = supertest.agent(server);

//Chai setup
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const addListExample = require('../../database/seeds/examples/addList');

describe('User controllers', function () {
  describe('SignUp', function() {
    it('should add new user', function (done) {
      request
        .post('/user/signup')
        .send({
          name: 'Lisa',
          email: 'email@gmail.com',
          password: 'password',
          phone: 0001231234
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var user = res.body;
          expect(user.userId).to.be.a('number');
          expect(user.name).to.have.string('Lisa');
          expect(user.email).to.have.length.above(10);
          expect(user).to.have.property('phone');
          expect(user.myLists).to.be.an('array');
          expect(user.sharedLists).to.be.an('array');
          done();
        });
    });
  });

  describe('SignIn', function() {
    it('should return basic user info', function (done) {
      request
        .post('/user/signin')
        .send({
          email: 'email@gmail.com',
          password: 'password'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var user = res.body;
          expect(user.userId).to.be.a('number');
          // expect(user).to.have.property('name');
          expect(user.email).to.have.length.above(10);
          expect(user.myLists).to.be.an('array');
          // expect(user.sharedLists).to.be.an('array');
          done();
        });
    });
    //TODO: test failing
  });
});

describe('Store controllers', function () {
  describe('Search', function() {
    it('should return search results', function (done) {
      request
        .get('/store/search?city=NewYork&keyword=food')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var results = res.body;
          expect(results).to.have.length.above(5); 
          expect(results[0]).to.have.property('zomato_id');
          expect(results[0]).to.have.property('name');
          expect(results[0].location).to.have.lengthOf(2);
          expect(results[0].address).to.have.lengthOf(6);
          done();
        });
    });

    it('should find store\'s location when searched', function (done) {
      request
        .get('/store/search?city=NewYork&keyword=food')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var result = res.body[0].address;
          expect(result[2]).to.have.string('New York');
          expect(result[3]).to.have.lengthOf(2);
          expect(Number(result[4])).to.be.closeTo(10000, 50);
          expect(result[5]).to.equal('United States');
          done();
        });
    });
  });

  describe('Reviews', function() {
    it('should return reviews of a store', function (done) {
      request
        .get('/store/reviews?zomato_id=16843649')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var reviews = res.body;
          expect(reviews).to.have.length.of.at.least(1); 
          expect(reviews[0]).to.have.all.keys([
            'zomato_id', 'rating', 'user', 'text', 
            'likes', 'timestamp', 'friendly_time'
          ]);
          done();
        });
    });
  });

});

describe('List controllers', function () {
  var listId = 1;

  describe('Add My List', function() {
    it('should add new list', function (done) {
      request
        .post('/list')
        .send({
          title: 'List Title',
          userId: 1,
          userName: 'Lisa',
          description: 'This is description',
          city: 'New York City',
          list: addListExample
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          listId = res.body.listId;
          expect(listId).to.be.a('number');

          knex('lists').where('id', listId)
            .then((lists) => {
              var list = lists[0];
              expect(list.user_id).to.equal(1);
              expect(list.title).to.have.string('List Title');
              expect(list.user_name).to.have.string('Lisa');
              expect(list.description).to.have.length.above(10);
              expect(list.city).to.have.string('New York');

              done();
            })
            .catch((err) => {
              console.log("cannot find a list ", err);
            });
        });
    });
  });

  describe('Add Shared List', function() {
    beforeEach((done) => {
      // delete from shared_lists where user_id=2;
      knex('shared_lists').where('user_id', 2).del()
        .then(() => {
          done();
        })
        .catch((err) => {
          console.log("cannot delete from shared_lists ", err);
        });
    })
    it('should add a shared list', function (done) {
      request
        .post('/list/shared')
        .send({
          userId: 2,
          listId: listId
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          knex('shared_lists').where('user_id', 2)
            .then((sharedList) => {
              expect(sharedList[0].list_id).to.equal(listId);
            })
            .catch((err) => {
              console.log("cannot find a list from shared_lists ", err);
            });
            
          done();
      });
    });
  });

  describe('Get List', function() {
    it('should get basic info', function (done) {
      request
        .get('/list')
        .send({listId: listId})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var list = res.body.list;

          expect(list.user_id).to.exist;
          expect(list.title).to.be.a('string');
          expect(list.user_name).to.have.length.above(2);
          expect(list.city).to.have.length.above(4);

          done();
        });
    });

    it('should get store info', function (done) {
      request
        .get('/list')
        .send({listId: listId})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          var stores = res.body.list.stores;

          expect(stores).to.have.length.above(5); 
          expect(stores[0]).to.have.property('zomato_id');
          expect(stores[0]).to.have.property('name');
          expect(stores[0].location).to.have.lengthOf(2);
          expect(stores[0].address).to.be.an('array');

          done();
        });
    });

    it('should have store type and categories', function (done) {
      request
        .get('/list')
        .send({listId: listId})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          var store = res.body.list.stores[0];

          expect(store).to.have.property('type');
          expect(store.type).to.be.a('string');
          expect(store).to.have.property('categories');
          expect(store.categories).to.be.an('array');
          done();
        });
    });
  });

  describe('Get Lists', function() {
    it('should get myLists', function (done) {
      request
        .get('/list/all')
        .send({userId: 1})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          
          var data = res.body;
          expect(data).to.have.property('myLists');
          expect(data.myLists).to.be.an('array');
          expect(data.myLists).to.have.length.of.at.least(1);
          done();
        });
    });

    it('should get sharedLists', function (done) {
      request
        .get('/list/all')
        .send({userId: 2})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          
          var data = res.body;
          expect(data).to.have.property('sharedLists');
          expect(data.sharedLists).to.be.an('array');
          expect(data.sharedLists).to.have.length.of.at.least(1);
          done();
        });
    });
  });

  describe('Update List', function() {
    it('should delete previous list from lists table', function (done) {
      request
        .put('/list')
        .send({
          title: 'List Title',
          userId: 1,
          listId: listId,
          userName: 'Lisa',
          description: 'This is description',
          city: 'New York City',
          list: addListExample
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          knex('lists')
            .where({id: listId})
            .then((list) => {
              expect(list[0]).to.not.exist;
            });
          
          listId = res.body.listId;
          expect(listId).to.be.a('number');

          done();
        });
    });

    it('should add new list to lists table', function (done) {
      request
        .put('/list')
        .send({
          title: 'List Title',
          userId: 1,
          listId: listId,
          userName: 'Lisa',
          description: 'This is description',
          city: 'New York City',
          list: addListExample
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          listId = res.body.listId;
          expect(listId).to.be.a('number');

          knex('lists')
            .where({id: listId})
            .then((lists) => {
              expect(lists[0]).to.exist;
            })

          done();
        });
    });
  });

  describe('Delete My List', function() {
    it('should delete from lists table', function (done) {
      request
        .delete('/list')
        .send({listId: listId})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          knex('lists')
            .where({id: listId})
            .then((list) => {
              expect(list[0]).to.not.exist;
            })

          done();
        });
    });

    it('should delete from shared-lists table', function (done) {
      request
        .delete('/list')
        .send({listId: listId})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          knex('shared_lists')
            .where({list_id: listId})
            .then((lists) => {
              expect(lists[0]).to.not.exist;
            })

          done();
        });
    });
  });

  describe('Delete Shared List', function() {
    it('should delete from shared-lists table', function (done) {
      request
        .delete('/list/shared')
        .send({
          userId: 2,
          listId: listId
        })
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          knex('shared_lists')
            .where({
              user_id: 2,
              list_id: listId
            })
            .then((lists) => {
              expect(lists[0]).to.not.exist;
            })

          done();
        });
    });
  });
});
