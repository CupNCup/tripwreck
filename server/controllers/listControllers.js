//Database
const listsCollection = require('../../database/collections').Lists;
const Lists = new listsCollection();

//Node v7 do not support async/await
const async = require('asyncawait/async');
const await = require('asyncawait/await');

var list = require('../../database/seeds/examples/addList');

module.exports = {
  //add new List
  addMyList: async((req, res) => {
    var data = req.body;
    var listId = await(Lists.make(data));
    res.status(201).send({listId: listId});
  }),

  //add sharedList
  addSharedList: async((req, res) => {
    var userId = req.body.userId;
    var listId = req.body.listId;
    await(Lists.addSharedList(userId, listId));
    res.sendStatus(201);
  }),

  //get detailed informations on stores in a list
  getList: async((req, res) => {
    var listId = req.body.listId;
    var list = await(Lists.getInfo(listId));

    //make type_name and category_names property
    list = JSON.parse(JSON.stringify(list));
    var stores = list.stores;
    stores.forEach((store) => {
      store.type = store.type.name;
      var categories = store.categories;
      store.categories = categories.map((category) => {
        return category.name;
      });
    });

    res.status(200).send({list: list});
  }),

  //get all lists associated with a user
  getLists: async((req, res) => {
    var userId = req.body.userId;
    var myLists = await(Lists.getMyLists(userId));
    var sharedLists = await(Lists.getSharedLists(userId));
    
    res.status(200).send({
      myLists: myLists,
      sharedLists: sharedLists
    });

  }),

  //edit a list
  updateList: async((req, res) => {
    var data = req.body;
    //delete the list and create new list
    await(Lists.deleteMyList(data.listId));
    var listId = await(Lists.make(data));
    res.status(201).send({listId: listId});
  }),

  //delete myList (list I created)
  deleteMyList: async((req, res) => {
    var listId = req.body.listId;
    await(Lists.deleteMyList(listId));
    res.sendStatus(200);
  }),

  //delete a sharedList (list someone shared with me)
  deleteSharedList: async((req, res) => {
    var userId = req.body.userId;
    var listId = req.body.listId;
    await(Lists.deleteSharedList(userId, listId));
    res.sendStatus(200);
  })

  //delete multiple lists
  
};