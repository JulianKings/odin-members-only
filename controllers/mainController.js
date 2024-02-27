const User = require("../models/user");
const Message = require("../models/message");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const bcrypt = require('bcryptjs');

exports.home = asyncHandler(async (req, res, next) => {
    const allMessages = await Message.find().sort({ timestamp: -1}).populate("author").exec();

    res.render('index', { title: "Members Only", sessionMessage: req.session.messages, 
        user: req.user, messages: allMessages });
});

exports.get_signup = function(req, res, next) {
    res.render('sign-up', { layout: false, title: "Sign Up", errors: undefined });
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
            res.render('sign-up', { layout: false, title: "Sign Up", errors: errors.array() });
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

exports.post_message = [
    body("message", "Message must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = req.user;

        if(!user)
        {
            const err = new Error("Message's author not found");
            err.status = 404;
            return next(err);
        }

        const message = new Message({
            message: req.body.message,
            author: user._id,
            timestamp: new Date()
        })

        if(!errors.isEmpty())
        {
            res.redirect("/");
        } else {
            const result = await message.save();
            res.redirect("/");
        }
    }),
]

exports.join_membership_get = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if(!user)
    {
        res.redirect("/");
    } else {
        res.render('join_membership', { title: "Members Only", sessionMessage: req.session.messages, 
            user: user, errors: undefined });
    }
});

exports.join_membership_post = [
    body("secret_password", "Secret password must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .custom((value, { req }) => {
            return (value === req.app.settings.join_secret_password);
        })
        .withMessage("Secret password is invalid."),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = req.user;

        if(!user)
        {
            res.redirect("/");
        } else {
            const updatedUser = new User({
                username: user.username,
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                membership_status: true,
                admin: user.admin,
                _id: user._id
            })

            if(!errors.isEmpty())
            {
                res.render('join_membership', { title: "Members Only", sessionMessage: req.session.messages, 
                    user: user, errors: errors.array() });
            } else {
                const result = await User.findByIdAndUpdate(user._id, updatedUser, {});
                res.redirect("/");
            }
        }
    }),
]

exports.join_admin_get = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if(!user)
    {
        res.redirect("/");
    } else {
        res.render('admin_join', { title: "Members Only", sessionMessage: req.session.messages, 
        user: user, errors: undefined });
    }
});

exports.join_admin_post = [
    body("secret_password", "Secret password must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .custom((value, { req }) => {
            return (value === req.app.settings.admin_secret_password);
        })
        .withMessage("Secret password is invalid."),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = req.user;

        if(!user)
        {
            res.redirect("/");
        } else {
            const updatedUser = new User({
                username: user.username,
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                membership_status: user.membership_status,
                admin: true,
                _id: user._id
            })

            if(!errors.isEmpty())
            {
                res.render('admin_join', { title: "Members Only", sessionMessage: req.session.messages, 
                    user: user, errors: errors.array() });
            } else {
                const result = await User.findByIdAndUpdate(user._id, updatedUser, {});
                res.redirect("/");
            }
        }
    }),
]

exports.messages_delete_get = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if(!user)
    {
        res.redirect("/");
    } else {
        if(!user.admin)
        {
            res.redirect("/");
        } else {
            const message = await Message.findById(req.params.id);

            if(!message)
            {
                res.redirect("/");
            } else {
                await Message.findByIdAndDelete(req.params.id);
                res.redirect("/");
            }

        }
    }
});