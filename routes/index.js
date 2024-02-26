var express = require('express');
var router = express.Router();

const main_controller = require("../controllers/mainController");

/* GET home page. */
router.get('/', main_controller.home);
router.get('/sign-up', main_controller.get_signup);
router.post('/sign-up', main_controller.post_signup);

module.exports = router;
