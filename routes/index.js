const { find } = require('../controllers/metadataController')
const { findImage } = require('../controllers/imageController')

const router = require('express').Router();
router.get('/avatars/:id', find);
router.get('/images/:id', findImage);

module.exports = router;
