const express = require('express');
const router = express.Router();

const studyPlanController = require('../controllers/studyPlanControllers');

router.post('/', studyPlanController.createStudyPlan);
router.get('/', studyPlanController.readStudyPlans);
router.get('/:id', studyPlanController.readStudyPlan);
router.put('/:id', studyPlanController.updateStudyPlan);
router.delete('/:id', studyPlanController.deleteStudyPlan);

module.exports = router;
