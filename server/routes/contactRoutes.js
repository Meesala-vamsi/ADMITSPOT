const express = require("express");
const {getContacts} = require("../controllers/contactsController");
const router = express.Router();

router.get("/retrieve",getContacts);


module.exports =router;