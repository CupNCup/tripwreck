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
  //can be used with async/await
  //name is always in lowercase

// Users
// getMyLists: function(){
//   var user_id = this.get('user_id');
//   Collections.Lists.fetchAll({user_id: user_id})
//     .then((lists) => {
//       console.log(lists);
//     })
// },

// getSharedLists: function() {

// },

// addList: function(list_id) {
//   console.log('added', this);
//   var lists = this.getMyLists();
//   lists = [list_id].concat(lists);
//   this.set('lists', lists);
// },
// deleteList: function(list_id) {
//   var lists = this.get('lists');
//   var ind = lists.indexOf(list_id);
//   var deleted = lists.splice(ind, 1);
//   this.set('lists', lists);
//   console.log('deleted', deleted, this);
// }

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
}

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
}

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
}

//store
// getInfo: function(id) {
//     Store.forge({id: id}).fetch({withRelated: ['types']})  
//       .then(function(store) {
//           console.log('Got store:', store.get('name'));
//           console.log('Got type:', store.related('types'));
//       });
//   }

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
        // use attach instead of raw sql 
        // store.categories().attach(category_ids)
        console.log(category_ids)
        category_ids = category_ids.map((category_id) => {
          return `${store.id},${category_id}`
        })
        var query = `insert into stores_categories (store_id, category_id) values (${category_ids.join("),(")});`;
        knex.raw(query)
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
})

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
      })
      console.log(zomatoIds)
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
                        //find ids of stores that needs to be created
                        var Stores = new Collections.Stores();
                        storeArr.forEach(async((store) => {
                          if(zomato_ids.indexOf(store.zomato_id) !== -1) {
                            ids.push(await(Stores.addNew(store)));
                          }
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

//add new list to shared_list
Collections.Users.prototype.addList = (userId, listId) => {
  return new Promise((resolve, reject) => {
    // knex.insert()
  });
}


module.exports = Collections;
