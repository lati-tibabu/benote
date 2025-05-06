const { Op } = require("sequelize");
const {
  team_membership,
  workspace_membership,
  task,
  workspace,
  user,
} = require("../models");
const allowedUpdates = [
  "title",
  "description",
  "status",
  "due_date",
  "assigned_to",
  "workspace_id",
  "is_archived",
];

const { sendNotification } = require("../services/notificationService");

// Create
// const createTask = async (req, res) => {
//   try {
//     if (req.body) {
//       if (Array.isArray(req.body)) {
//         const _tasks = await task.bulkCreate(req.body);

//         if (_tasks.length) {
//           return res.status(201).json(_tasks);
//         }
//         return res.status(400).json({ message: "Invalid task details!" });
//       }
//       const _task = await task.create(req.body);
//       res.status(201).json(_task);
//     } else {
//       res.status(400).json({ message: "Invalid task details!" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createTask = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Invalid task details!" });
    }

    // Case: Multiple Tasks
    if (Array.isArray(req.body)) {
      const _tasks = await task.bulkCreate(req.body);

      for (const t of _tasks) {
        if (t.assigned_to) {
          await sendNotification({
            message: `You have been assigned a new task: "${t.title}"`,
            type: "info",
            receiver_id: t.assigned_to,
            sender_id: req.user?.id || null,
            action: { taskId: t.id },
          });
        }
      }

      return res
        .status(201)
        .json(_tasks.length ? _tasks : { message: "Invalid task details!" });
    }

    // Case: Single Task
    const _task = await task.create(req.body);

    if (_task.assigned_to) {
      await sendNotification({
        message: `You have been assigned a new task: "${_task.title}"`,
        type: "info",
        receiver_id: _task.assigned_to,
        sender_id: req.user?.id || null,
        action: { taskId: _task.id },
      });
    }

    res.status(201).json(_task);
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readTasks = async (req, res) => {
  const isOnHome = req.query.home === "true" ? true : false || false;
  const userId = req.user.id;
  try {
    let _tasks;
    if (isOnHome) {
      _tasks = await task.findAll({
        where: {
          is_archived: false,
          assigned_to: userId,
        },
        attributes: ["title", "description", "due_date", "status"],
        include: [
          {
            model: workspace,
            as: "workspace",
            required: false,
            attributes: ["id", "name"],
          },
          {
            model: user,
            as: "user",
            required: false,
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      });
    } else {
      _tasks = await task.findAll({
        where: {
          is_archived: false,
          workspace_id: req.params.id,
        },
        include: [
          {
            model: workspace,
            as: "workspace",
            required: false,
            attributes: ["id", "name"],
          },
          {
            model: user,
            as: "user",
            required: false,
            attributes: ["id", "name", "email"],
          },
        ],
      });
    }
    if (!_tasks) {
      return res.status(404).json({ message: "No tasks found!" });
    }
    res.json(_tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readTask = async (req, res) => {
  try {
    const _task = await task.findByPk(req.params.id, {
      include: [
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
        {
          model: user,
          as: "user",
          required: false,
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (_task) {
      res.json(_task);
    } else {
      res.status(404).json({ message: "Task not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readTaskNotDone = async (req, res) => {
  try {
    const userId = req.user.id;

    let _tasks = await task.findAndCountAll({
      where: {
        is_archived: false,
        status: {
          [Op.not]: "done",
        },
        assigned_to: userId,
      },
      attributes: ["title", "description", "due_date", "status"],
      include: [
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
        {
          model: user,
          as: "user",
          required: false,
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    if (!_tasks) {
      return res.status(404).json({ message: "No tasks found!" });
    }
    const newTasks = _tasks.rows.map((task) => {
      let newTask = { ...task };
      newTask.user = task["user.name"];
      newTask.workspace = task["workspace.name"];
      newTask.workspace_id = task["workspace.id"];

      newTask.timeLeft = new Date(task.due_date) - new Date();
      newTask.timeLeft = Math.floor(newTask.timeLeft / (1000 * 60 * 60 * 24)); // Convert to days

      newTask.taskStatus = newTask.timeLeft < 0 ? "overdue" : "on time";

      delete newTask["workspace.name"];
      delete newTask["workspace.id"];
      delete newTask["user.name"];
      return newTask;
    });

    // _tasks = newTasks;
    if (_tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found!" });
    }

    newTasks.sort((a, b) => {
      return a.timeLeft - b.timeLeft;
    });

    res.json([_tasks.count, newTasks]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all tasks assigned to a user
const readTasksAssignedToUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const _tasks = await task.findAll({
      where: {
        assigned_to: userId,
        is_archived: false,
      },
      include: [
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
        {
          model: user,
          as: "user",
          required: false,
          attributes: ["name"],
        },
      ],
      raw: true,
    });
    const newTasks = _tasks.map((task) => {
      let newTask = { ...task };
      newTask.user = task["user.name"];
      newTask.workspace = task["workspace.name"];
      newTask.workspace_id = task["workspace.id"];
      newTask.timeLeft = new Date(task.due_date) - new Date();
      newTask.timeLeft = Math.floor(newTask.timeLeft / (1000 * 60 * 60 * 24)); // Convert to days
      newTask.timeElapsed = Math.floor(
        (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)
      );

      newTask.taskStatus = newTask.timeLeft < 0 ? "overdue" : "on time";
      delete newTask["workspace.name"];
      delete newTask["workspace.id"];
      delete newTask["user.name"];
      return newTask;
    });

    res.json(newTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all tasks assigned to a workspace
const readTasksAssignedToWorkspace = async (req, res) => {
  try {
    const _tasks = await task.findAll({
      where: {
        workspace_id: req.params.id,
      },
      include: [
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
        {
          model: user,
          as: "user",
          required: false,
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json(_tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read archived tasks
const readArchivedTasks = async (req, res) => {
  try {
    const _tasks = await task.findAll({
      where: {
        is_archived: true,
        workspace_id: req.params.workspace_id,
      },
      include: [
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
        {
          model: user,
          as: "user",
          required: false,
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json(_tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const archiveTask = async (req, res) => {
  try {
    const _task = await task.findByPk(req.params.id);
    if (_task) {
      await _task.update({ is_archived: true });
      res.json({ message: "Task successfully archived!" });
    } else {
      res.status(404).json({ message: "Task not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unarchive task
const unarchiveTask = async (req, res) => {
  try {
    const _task = await task.findByPk(req.params.id);
    if (_task) {
      await _task.update({ is_archived: false });
      res.json({ message: "Task successfully unarchived!" });
    } else {
      res.status(404).json({ message: "Task not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
// const updateTask = async (req, res) => {
//   try {
//     const _task = await task.findByPk(req.params.id);
//     if (_task) {
//       await _task.update(req.body, { fields: allowedUpdates });
//       const updatedTask = { ..._task.get() };
//       res.json(updatedTask);
//     } else {
//       res.status(404).json({ message: "Task not found!" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const updateTask = async (req, res) => {
  try {
    // Fetch the task by ID
    const _task = await task.findByPk(req.params.id);
    const { status } = req.query; // Get the status from the query parameters
    if (_task) {
      // Update the task fields
      await _task.update(req.body, { fields: allowedUpdates });
      const updatedTask = { ..._task.get() };

      if (status) {
        // Get the workspace ID of the task
        const workspaceId = _task.workspace_id;

        const workspaceMembers = await workspace_membership.findAll({
          where: { workspace_id: workspaceId },
          attributes: ["user_id", "team_id"],
        });

        const userIdsSet = new Set();

        for (const member of workspaceMembers) {
          if (member.user_id) {
            userIdsSet.add(member.user_id);
          }

          if (member.team_id) {
            const teamMembers = await team_membership.findAll({
              where: { team_id: member.team_id },
              attributes: ["user_id"],
            });

            for (const teamMember of teamMembers) {
              if (teamMember.user_id) {
                userIdsSet.add(teamMember.user_id);
              }
            }
          }
        }

        const message = `Task "${_task.title}" has been updated to ${status}.`;

        for (const receiver_id of userIdsSet) {
          await sendNotification({
            message,
            type: "info",
            receiver_id,
            sender_id: null,
            action: { taskId: _task.id, workspace: _task.workspace_id },
          });
        }
      }
      // Return the updated task in the response
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteTask = async (req, res) => {
  try {
    const _task = await task.findByPk(req.params.id);
    if (_task) {
      await _task.destroy();
      res.json({ message: "Task successfully deleted!" });
    } else {
      res.status(404).json({ message: "Task not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  readTasks,
  readTask,
  readTasksAssignedToUser,
  readTasksAssignedToWorkspace,
  readArchivedTasks,
  readTaskNotDone,
  archiveTask,
  unarchiveTask,
  updateTask,
  deleteTask,
};
