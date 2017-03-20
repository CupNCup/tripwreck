
exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([{
        id: 1, phone:1234567890,
        auth_id: 'caa47ac6-81d1-408a-8090-6c86cefcfddb'
      },{
        id: 2, phone:0987654321,
        auth_id: '262dc276-86f9-4584-849e-08531534b7f6'
      },{
        id: 3, phone:0000000000,
        auth_id: '91b1258a-3840-4d1f-954b-163e487ddcc9'
      }]);
    });
};
