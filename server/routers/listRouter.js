const express = require('express');
const listRouter = express.Router();
const listControllers = require('../controllers/listControllers.js');

listRouter.route('/')
  .post(listControllers.addMyList)
  .get(listControllers.getList)
  .put(listControllers.updateList)
  .delete(listControllers.deleteMyList)

listRouter.route('/shared')
  .post(listControllers.addSharedList)
  .delete(listControllers.deleteSharedList)

listRouter.get('/all', listControllers.getLists);

module.exports = listRouter;