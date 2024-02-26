var express = require('express');
var router = express.Router();

const main_controller = require("../controllers/mainController");

/* GET home page. */
router.get('/', main_controller.home);

module.exports = router;
