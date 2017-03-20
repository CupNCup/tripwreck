const Collections = require('../../database/collections');
const Users = new Collections.Users();

//Node v7 do not support async/await
const async = require('asyncawait/async');
const await = require('asyncawait/await');

//Implement firebase
//Implement uuid
module.exports = {
  signUp: async((req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var phone = req.body.phone;
    //change this after firebase Implementation
    var authId = 'caa47ac6-81d1-408a-8090weaasdfsdasd';
    var user = await(Users.make(authId));

    console.log('user', user)
    //if user is null return 404
    if(!user) {
      res.sendStatus(404);
    }

    res.status(201).send({
      name: name,
      email: email,
      userId: user.id,
      phone: phone,
      myLists: [],
      sharedLists: []
    });
  }),

  signIn: async((req, res) => {
    //get name from firebase
    var name;
    var email = req.body.email;
    var password = req.body.password;

    //change this after firebse Implementation
    var authId = 'caa47ac6-81d1-408a-8090-6c86cefcfddb';

    //find user info with authId
    var user = await(Users.find(authId));

    // user = JSON.parse(JSON.stringify(user));

    //if user is null return 404
    if(!user) {
      res.sendStatus(404);
    }

    //get lists created by user
    const Lists = new Collections.Lists();
    var myLists = await(Lists.getMyLists(user.id));

    res.status(200).send({
      name: name,
      email: email,
      userId: user.id,
      phone: user.phone,
      myLists: myLists,
      sharedLists: user.lists
    });
  })

  //delete account
    //delete all the list I created
    //delete all the shared list
}