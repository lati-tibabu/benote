const { Op, Sequelize } = require("sequelize");
const models = require("../models");

const searchUserData = async (req, res) => {
  const userId = req.user.id;
  const { query, type, page = 1, pageSize = 10 } = req.query;
  let results = [];
  let total = 0;

  if (!type) return res.status(400).json({ message: "Type is required" });

  const offset = (page - 1) * pageSize;
  const where = { user_id: userId };

  if (query) {
    if (type === "tasks") {
      // Tasks: assigned_to field (not user_id!)
      const taskWhere = {
        assigned_to: userId,
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { status: { [Op.iLike]: `%${query}%` } },
        ],
      };
      const { rows: taskRows, count: taskCount } =
        await models.task.findAndCountAll({
          where: taskWhere,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
        });
      results = taskRows;
      total = taskCount;
    } else if (type === "notifications") {
      // Notifications: receiver_id field, cast enum type to text for ILIKE
      const notifWhere = {
        receiver_id: userId,
        [Op.or]: [
          { message: { [Op.iLike]: `%${query}%` } },
          Sequelize.where(Sequelize.cast(Sequelize.col("type"), "TEXT"), {
            [Op.iLike]: `%${query}%`,
          }),
        ],
      };
      const notifResult = await models.notification.findAndCountAll({
        where: notifWhere,
        limit: +pageSize,
        offset,
        order: [["createdAt", "DESC"]],
      });
      results = notifResult.rows;
      total = notifResult.count;
    } else if (type === "study_plans") {
      // Study plans: user_id field
      where[Op.or] = [{ title: { [Op.iLike]: `%${query}%` } }];
      const { rows: spRows, count: spCount } =
        await models.study_plan.findAndCountAll({
          where,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
        });
      results = spRows;
      total = spCount;
    } else if (type === "roadmaps") {
      // Roadmaps: created_by field (not user_id!)
      const roadmapWhere = {
        created_by: userId,
        [Op.or]: [{ title: { [Op.iLike]: `%${query}%` } }],
      };
      const { rows: roadmapRows, count: roadmapCount } =
        await models.roadmap.findAndCountAll({
          where: roadmapWhere,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
        });
      results = roadmapRows;
      total = roadmapCount;
    } else if (type === "classrooms") {
      // Classrooms: user is a student/member (many-to-many, alias: students)
      const classroomWhere = {
        [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }],
      };
      const { rows: classroomRows, count: classroomCount } =
        await models.classroom.findAndCountAll({
          include: [
            {
              model: models.user,
              as: "students", // alias for students association
              where: { id: userId },
              attributes: [],
              through: { attributes: [] },
            },
          ],
          where: classroomWhere,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
          distinct: true,
        });
      results = classroomRows;
      total = classroomCount;
    } else if (type === "teams") {
      // Teams: user is a member (many-to-many, alias: members)
      const teamWhere = {
        [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }],
      };
      const { rows: teamRows, count: teamCount } =
        await models.team.findAndCountAll({
          include: [
            {
              model: models.user,
              as: "members", // alias for members association
              where: { id: userId },
              attributes: [],
              through: { attributes: [] },
            },
          ],
          where: teamWhere,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
          distinct: true,
        });
      results = teamRows;
      total = teamCount;
    } else if (type === "workspace") {
      // Workspaces: user is a member (many-to-many, alias: members)
      const workspaceWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      };
      const { rows: wsRows, count: wsCount } =
        await models.workspace.findAndCountAll({
          include: [
            {
              model: models.user,
              as: "users", // alias for members association
              where: { id: userId },
              attributes: [],
              through: { attributes: [] },
            },
          ],
          where: workspaceWhere,
          limit: +pageSize,
          offset,
          order: [["createdAt", "DESC"]],
          distinct: true,
        });
      results = wsRows;
      total = wsCount;
    }
  }

  res.json({ results, total, page: +page, pageSize: +pageSize });
};

module.exports = { searchUserData };
