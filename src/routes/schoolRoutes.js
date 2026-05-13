const { Router } = require('express');
const validate = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');
const { addSchoolSchema, listSchoolsSchema } = require('../validations/schoolValidation');
const { addSchool, listSchools } = require('../controllers/schoolController');

const router = Router();

router.post('/addSchool', validate(addSchoolSchema), asyncHandler(addSchool));
router.get('/listSchools', validate(listSchoolsSchema), asyncHandler(listSchools));

module.exports = router;
