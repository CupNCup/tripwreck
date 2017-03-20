const express = require('express');
const userRouter = express.Router();
const userControllers = require('../controllers/userControllers.js');

userRouter.post('/signup', userControllers.signUp);
userRouter.post('/signin', userControllers.signIn);

// userRouter.route('/')
//   .put(userControllers.updateUser)
//   .delete(userControllers.deleteUser);

module.exports = userRouter;