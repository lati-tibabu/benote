const express = require("express");
const userRoutes = require('./userRoutes');
const workspaceRoutes = require('./workspaceRoutes');
const teamRoutes = require('./teamRoutes');
const classroomRoutes = require('./classroomRoutes');
const assignmentRoutes = require('./assignmentRoutes');
// load these routes discussion, mindmap, mindmap_item, roadmap, roadmap_item, study_plan, submission, task, time_block, todo, todo_item

const discussionRoutes = require('./discussionRoutes');
const mindmapRoutes = require('./mindmapRoutes');
const mindmapItemRoutes = require('./mindmapItemRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const roadmapItemRoutes = require('./roadmapItemRoutes');
const studyPlanRoutes = require('./studyPlanRoutes');
const submissionRoutes = require('./submissionRoutes');
const taskRoutes = require('./taskRoutes');
const timeBlockRoutes = require('./timeBlockRoutes');
const todoRoutes = require('./todoRoutes');
const todoItemRoutes = require('./todoItemRoutes');
const courseRoutes = require('./courseRoutes');
const userTeamRoutes = require('./userTeamRoutes');

const authRoutes = require('./authRoutes');
const { logoutController } = require("../middlewares/authMiddleware");


const router = express.Router();

router.use('/users', userRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/teams', teamRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/discussions', discussionRoutes);
router.use('/mindmaps', mindmapRoutes);
router.use('/mindmapItems', mindmapItemRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/roadmapItems', roadmapItemRoutes);
router.use('/studyPlans', studyPlanRoutes);
router.use('/submissions', submissionRoutes);
router.use('/tasks', taskRoutes);
router.use('/timeBlocks', timeBlockRoutes);
router.use('/todos', todoRoutes);
router.use('/todoItems', todoItemRoutes);
router.use('/courses', courseRoutes);
router.use('/user-team', userTeamRoutes);


router.use('/auth', authRoutes);

router.post('/logout', logoutController);

module.exports = router;