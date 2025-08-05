const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { analyzeExcel } = require('../controllers/analyzeController');

router.post('/analyze', upload.single('excelFile'), analyzeExcel);

module.exports = router;
