var express = require('express');
var router = express.Router();

const main_controller = require("../controllers/mainController");

router.get('/', main_controller.home);
router.get('/sign-up', main_controller.get_signup);
router.post('/sign-up', main_controller.post_signup);
router.post('/post-message', main_controller.post_message);
router.get('/join-admin', main_controller.join_admin_get);
router.post('/join-admin', main_controller.join_admin_post);
router.get('/join-membership', main_controller.join_membership_get);
router.post('/join-membership', main_controller.join_membership_post);
router.get("/messages/:id/delete", main_controller.messages_delete_get);

module.exports = router;
