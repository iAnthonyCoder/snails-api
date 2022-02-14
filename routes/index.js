const { find, findDefault } = require('../controllers/metadataController')
const { findImage } = require('../controllers/imageController')
const { add, get } = require('../controllers/ruffleController')

const router = require('express').Router();
router.get('/avatars/:id', find);
router.get('/default/:id', findDefault);
router.get('/images/:id', findImage);
router.post('/ruffle', add);
router.get('/ruffle', get);

module.exports = router;
