const { Router } = require("express");
const { createUser } = require("./user.ctrl");
const router = Router();

router.route("/").post(createUser)

module.exports = router;
