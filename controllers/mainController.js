const User = require("../models/user");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const bcrypt = require('bcryptjs');

exports.home = function(req, res, next) {
    res.render('index', { title: "Members Only", sessionMessage: req.session.messages, user: req.user });

};

exports.get_signup = function(req, res, next) {
    res.render('sign-up', { title: "Sign Up", errors: undefined });
};

exports.post_signup = [
    // Validate and sanitize fields.
    body("username", "User name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .isLength({ max: 12 })
        .withMessage('User name cannot exceed 12 characters.')
        .custom(async value => {
            const user = await User.findOne({ username: value });
            if(user) {
                throw new Error('User name already in use')
            }
        }),
    body("password", "Password must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .isLength({ max: 12 })
        .withMessage('Password cannot exceed 12 characters.'),
    body("user_first_name", "User First name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .isLength({ max: 14 })
        .withMessage('User first name cannot exceed 14 characters.'),
    body("user_last_name", "")
        .trim()
        .optional({ values: "falsy" })
        .escape(),
    body("confirm_password", "Confirm password must not be empty.")
        .trim()
        .isLength({min: 1})
        .escape()
        .custom((value, { req }) => {
            return (value === req.body.password);
        })
        .withMessage('Password must match confirm password.'),    

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const user = new User({
            username: req.body.username,
            password: req.body.password,
            first_name: req.body.user_first_name,
            last_name: req.body.user_last_name,
            membership_status: false,
            admin: false
        })

        if(!errors.isEmpty())
        {
            res.render('sign-up', { title: "Sign Up", errors: errors.array() });
        } else {
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                if(err)
                {
                  err.status = 404;
                  return next(err);
                }
      
                user.password = hashedPassword;
                const result = await user.save();
                res.redirect("/");
            });
        }
    }),
]