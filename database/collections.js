const knex = require("./db.js");
const Models = require("./models.js");

//Node v7 do not support async/await
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const Collections = {
  Users: Models.Bookshelf.Collection.extend({
    model: Models.User
  }),

  Lists: Models.Bookshelf.Collection.extend({
    model: Models.List
  }),

  Stores: Models.Bookshelf.Collection.extend({
    model: Models.Store
  }),

  Types: Models.Bookshelf.Collection.extend({
    model: Models.Type
  }),

  Categories: Models.Bookshelf.Collection.extend({
    model: Models.Category
  })
};

//Custom function for Collections
  //all return promises and can be used with async/await
  //name is always in lowercase

//find type_id and make new type if it does not exist
Collections.Types.prototype.findOrCreateId = (typeName) => {
  typeName = typeName.trim().toLowerCase();
  return new Promise((resolve, reject) => {
    Collections.Types
      .query({where: {name: typeName}})
      .fetchOne()
      .then((type) => {
        if(type) {
          resolve(type.id);
        }

        //make new type if type doesn't exist
        new Models.Type({name: typeName})
          .save()
          .then((type) => {
            resolve(type.id);
          })
          .catch((err) => {
            reject('cannot create new Type Model ' + err);
          })
      })
      .catch((err) => {
        reject('cannot query Types Collection ' + err);
      });
  });
};

//find category_id and make new category if it does not exist
Collections.Categories.prototype.findOrCreateId = (categoryName) => {
  categoryName = categoryName.trim().toLowerCase();
  return new Promise((resolve, reject) => {
    Collections.Categories
      .query({where: {name: categoryName}})
      .fetchOne()
      .then((category) => {
        if(category) {
          resolve(category.id);
        }

        //make new category if category doesn't exist
        new Models.Category({name: categoryName})
          .save()
          .then((category) => {
            resolve(category.id);
          })
          .catch((err) => {
            reject('cannot create new Category Model ' + err);
          });
      })
      .catch((err) => {
        reject('cannot query Categories Collection ' + err);
      });
  });
};

//find category_ids and make new categories if it does not exist
Collections.Categories.prototype.findOrCreateIds = (categoryArr) => {
  categoryArr = categoryArr.map((categoryName) => {
    //remove spaces and lowercase category names
    return categoryName.trim().toLowerCase();
  })
  return new Promise((resolve, reject) => {
    knex.select('id').from('categories').whereIn('name', categoryArr)
      .then((ids) => {
        ids = ids.map((id) => {
          return id.id;
        })
        if(ids.length === categoryArr.length) {
          resolve(ids);
        }
        //Create tempory table with category names
        knex.raw('CREATE TABLE temp (name varchar(255));')
          .then((table) => {
            var categoryNames = `('${categoryArr.join("'),('")}')`;
            knex.raw(`INSERT INTO temp (name) VALUES ${categoryNames};`)
              .then(() => {
                //select category names that doesn't exist in categories table
                knex.select('name').from('temp')
                .whereRaw('name NOT IN(SELECT name FROM categories)')
                .then((names)=> {
                  //Drop temp table
                  knex.raw('DROP TABLE temp;')
                    .then(() => {
                      //make new categories that doesn't exist
                      var newCategories = Collections.Categories.forge(names);
                      newCategories.invokeThen('save')
                        .then((newCategories) => {
                          //get ids of newCategories
                          newCategories.forEach((idObj) => {
                            ids.push(idObj.id);
                          })
                          resolve(ids);
                        })
                        .catch((err) => {
                          resolve("cannot create new categories " + err);
                        })
                    })
                    .catch((err) => {
                      resolve("cannot drop temp table " + err);
                    })
                })
                .catch((err) => {
                  resolve("cannot select names that doesn't exist in categories table" + err);
                });
              })
              .catch((err) => {
                resolve("cannot insert into temp table " + err);
              });
          })
          .catch((err) => {
            resolve("cannot create temp table " + err);
          });
      })
      .catch((err) => {
        resolve("cannot select from categories " + err);
      });
  });
};

//add new store in database with storeInfo from client
Collections.Stores.prototype.addNew = async((storeInfo) => {
  return new Promise((resolve, reject) => {
    //get type_id from type_name
    var Types = new Collections.Types();
    var type_id = await(Types.findOrCreateId(storeInfo.type));

    //get category_ids from category_names
    var Categories = new Collections.Categories();
    var category_ids = await(Categories.findOrCreateIds(storeInfo.categories));
    
    //make new store model with storeInfo
    new Models.Store({
      name: storeInfo.name,
      zomato_id: storeInfo.zomato_id,
      location: storeInfo.location,
      //change JSON/javascript array to postgres array
      address: [JSON.stringify(storeInfo.address)],
      thumb: storeInfo.thumb,
      price: storeInfo.price,
      type_id: type_id
    }).save()
      .then((store) => {
        //attach in knex
          // category_ids = category_ids.map((category_id) => {
          //   return `${store.id},${category_id}`
          // })
          // var query = `insert into stores_categories (store_id, category_id) values (${category_ids.join("),(")});`;
          // knex.raw(query)

        store.categories().attach(category_ids)
          .then((store) => {
            resolve(store.id);
          })
          .catch((err) => {
            reject("cannot attach category_ids to store " + err);
          });
      })
      .catch((err) => {
        reject('cannot create new store ' + err);
      })
  });
});

//find store_id and make new store if needed
Collections.Stores.prototype.findOrCreateId = async((storeInfo) => {
  return new Promise((resolve, reject) => {
    Collections.Stores.query({ where: {
        name: storeInfo.name,
        location: storeInfo.location
      }})
      .fetchOne()
      .then((store) => {
        if(store) {
          resolve(store.id);
        }

        //make new store if type doesn't exist
        var newStoreId = await(Collections.Stores.addNew(storeInfo));
        resolve(newStoreId);
        
      })
      .catch((err) => {
        reject('cannot query store collection ' + err);
      });
  });
});

//find store_ids and make new stores if it does not exist
Collections.Stores.prototype.findOrCreateIds = async((storeArr) => {
    return new Promise((resolve, reject) => {
      var zomatoIds = storeArr.map((store) => {
        //remove spaces and lowercase store names
        return store.zomato_id;
      });

      knex.select('id', 'zomato_id').from('stores').whereIn('zomato_id', zomatoIds)
        .then((ids) => {
          ids = ids.map((id) => {
            return id.id;
          })
          if(ids.length === zomatoIds.length) {
            resolve(ids);
          }
          //Create tempory table with store zomatoIds
          knex.raw('CREATE TABLE temp (zomato_id varchar(100));')
            .then((table) => {
              var zomato_ids = `('${zomatoIds.join("'),('")}')`;
              knex.raw(`INSERT INTO temp (zomato_id) VALUES ${zomato_ids};`)
                .then(() => {
                  //select store zomato_ids that doesn't exist in stores table
                  knex.select('zomato_id').from('temp')
                  .whereRaw('zomato_id NOT IN(SELECT zomato_id FROM stores)')
                  .then((zomato_ids)=> {
                    //make new stores that doesn't exist
                    //change from object to array
                    zomato_ids = zomato_ids.map((obj) => {
                      return obj.zomato_id;
                    });

                    //Drop temp table
                    knex.schema.dropTable('temp')
                      .then(() => {
                        //find stores that needs to be created
                        var Stores = new Collections.Stores();
                        var storesNeedToBeCreated = storeArr.filter((store) => {
                          return zomato_ids.indexOf(store.zomato_id) !== -1;
                        });

                        //get categories that needs to be created
                        var categoriesNeeded = [];
                        storesNeedToBeCreated.forEach((stores) => {
                          stores.categories.forEach((category) => {
                            if(categoriesNeeded.indexOf(category) === -1) {
                              categoriesNeeded.push(category);
                            }
                          })
                        })

                        //create all of categories needed
                        var Categories = new Collections.Categories();
                        await(Categories.findOrCreateIds(categoriesNeeded));

                        //create new stores
                        storesNeedToBeCreated.forEach(async((store) => {
                            ids.push(await(Stores.addNew(store)));
                        }));

                        resolve(ids);
                      })
                      .catch((err) => {
                        resolve("cannot drop temp table " + err);
                      });
                  })
                  .catch((err) => {
                    resolve("cannot select zomato_ids that doesn't exist in stores table" + err);
                  });
                })
                .catch((err) => {
                  resolve("cannot insert into temp table " + err);
                });
            })
            .catch((err) => {
              resolve("cannot create temp table " + err);
            });
        })
        .catch((err) => {
          resolve("cannot select from stores " + err);
        });
    });
});

//add new list to myLists
Collections.Lists.prototype.make = (data) => {
  return new Promise((resolve, reject) => {
    //find storeIds
    var Stores = new Collections.Stores();
    var storeIds = await(Stores.findOrCreateIds(data.list));
    
    //make new list
    new Models.List({
      title: data.title,
      user_id: data.userId,
      user_name: data.userName,
      description: data.description,
      city: data.city
    }).save()
      .then((list) => {
        //add list_id and store_id to lists_stores table

        //attach in raw knex
          // storeIds = storeIds.map((storeId) => {
          //   return `${list.id},${storeId}`
          // })
          // var query = `insert into lists_stores (list_id, store_id) values (${storeIds.join("),(")});`;
          // Models.Bookshelf.knex.raw(query)

        list.stores().attach(storeIds)
          .then(() => {
            resolve(list.id);
          })
          .catch((err) => {
            reject("cannot attach storeIds to list " + err);
          });
      })
      .catch((err) => {
        reject("cannot create new list " + err);
      })
  });
};

//add add a shared list
Collections.Lists.prototype.addSharedList = (userId, listId) => {
  return new Promise((resolve, reject) => {
    //create a relation between the list and user
    knex('shared_lists')
      .insert({
        user_id: userId,
        list_id: listId
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("cannot insert into shared_lists " + err);
      })
  });
};

//delete list from myLists
Collections.Lists.prototype.deleteMyList = (listId) => {
  return new Promise((resolve, reject) => {
    //delete all relations list has in lists_stores table
      //use detach
    knex('shared_lists').where('list_id', listId).del()
      .then(() => {
        knex('lists_stores').where('list_id', listId).del()
          .then(() => {
            //delete the list
            knex('lists').where('id', listId).del()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                reject("cannot delete from lists " + err);
              })
          })
          .catch((err) => {
            reject("cannot delete from lists_stores " + err);
          })
      })
      .catch((err) => {
        reject("cannot delete from shared_lists " + err);
      });
  });
};

//delete from sharedList
Collections.Lists.prototype.deleteSharedList = (userId, listId) => {
  return new Promise((resolve, reject) => {
    //delete a relation user has with a list
    knex('shared_lists').where({
      user_id: userId,
      list_id: listId
    }).del()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("cannot delete from shared_lists table " + err);
      })
  });
};

//get detailed info on all stores in a list
Collections.Lists.prototype.getInfo = (listId) => {
  return new Promise((resolve, reject) => {
    Models.List.where({id: listId})
    //get type name and category names instead of ids
    .fetch({withRelated: ['stores.type', 'stores.categories']})
    .then((list) => {
        resolve(list);
    })
    .catch((err) => {
      reject("cannot find a list with listId " + err);
    });
  }); 
};

//get getMyLists (lists I created)
Collections.Lists.prototype.getMyLists = (userId) => {
  return new Promise((resolve, reject) => {
    //select all Lists associated with userId
    Collections.Lists
      .query({where: {user_id: userId}})
      .fetch()
      .then((lists) => {
        resolve(lists);
      })
      .catch((err) => {
        reject("cannot query lists collection with user_id " + err);
      })
  });
};

//get sharedLists (lists someone shared with me)
Collections.Lists.prototype.getSharedLists = (userId) => {
  return new Promise((resolve, reject) => {
    //select all of list_id from shared_lists table associated with userId
    knex.select('list_id').from('shared_lists').where('user_id', userId)
      .then((lists) => {
        lists[0] ? resolve(lists): resolve(null);
      })
      .catch((err) => {
        reject("cannot get list_ids from shared_lists table " + err);
      })
  });
};

//make a new user with authId
Collections.Users.prototype.make = (authId, phoneNum) => {
  return new Promise((resolve, reject) => {
    Models.User.where({auth_id: authId})
      new Models.User({
        auth_id: authId,
        phone: phoneNum
      }).save()
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          resolve(false);
          reject("cannot add new user with authId " + err);
        })
  });
};

//find a user with authId
Collections.Users.prototype.find = (authId) => {
  return new Promise((resolve, reject) => {
    Models.User.where({auth_id: authId})
      .fetch({withRelated: 'lists'})
      .then((user) => {
        user.id ? resolve(user) : resolve(null);
      })
      .catch((err) => {
        reject("cannot search users table " + err);
      })
  });
};

module.exports = Collections;
