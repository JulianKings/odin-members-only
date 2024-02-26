const User = require("../models/user");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.home = function(req, res, next) {
    res.render('index', { title: "Members Only", sessionMessage: req.session.messages });

};