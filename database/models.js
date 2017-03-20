const knex = require('./db');
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

const Models = {
  User: bookshelf.Model.extend({
    // Bookshelf assumes that table names are plurals 
    // and that the foreign key is the singular name of the related table fixed with _id
    tableName: "users",
    hasTimestamps: true,
    lists: function() {
      return this.belongsToMany(Models.List, 'shared_lists');
    }
  }),

  List: bookshelf.Model.extend({
    tableName: "lists",
    hasTimestamps: true,
    users: function() {
      return this.belongsToMany(Models.User, 'shared_lists');
    },
    stores: function() {
      return this.belongsToMany(Models.Store, 'lists_stores');
    }
  }),

  Store: bookshelf.Model.extend({
    tableName: "stores",
    lists: function() {
      return this.belongsToMany(Models.List, 'lists_stores');
    },
    categories: function() {
      return this.belongsToMany(Models.Category, 'stores_categories');
    },
    type: function() {
      return this.belongsTo(Models.Type);
    }
  }),

  Type: bookshelf.Model.extend({
    tableName: "types",
    stores: function() {
      return this.hasMany(Models.Store);
    }
  }),

  Category: bookshelf.Model.extend({
    tableName: "categories",
    stores: function() {
      return this.belongsToMany(Models.Store, 'stores_categories');
    }
  }),

  // SharedList: bookshelf.Model.extend({
  //   tableName: "shared_lists"
  // }),

  // Lists_Stores: bookshelf.Model.extend({
  //   tableName: "lists_stores",
    // list_id: function() {
    //     return this.hasMany(List);
    // },
    // store_id: function() {
    //     return this.hasMany(Store);
    // }
  // }),

  // Stores_Categories: bookshelf.Model.extend({
  //   tableName: "stores_categories"
  // }),

  Bookshelf: bookshelf
}

module.exports = Models