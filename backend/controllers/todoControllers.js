const { Op } = require("sequelize");
const { todo, todo_item, workspace } = require("../models");
// const workspace = require("../models/workspace");
// const todo_item = require("../models/todo_item");

// Create
const createTodo = async (req, res) => {
  try {
    const _todo = await todo.create(req.body);
    res.status(201).json(_todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readTodos = async (req, res) => {
  try {
    const _todos = await todo.findAll({
      where: {
        workspace_id: req.params.workspace_id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(_todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readTodosS = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || null;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const _todos = await todo.findAll({
      where: {
        user_id: userId,
        ...(date === "today" && {
          createdAt: {
            [Op.between]: [startOfToday, endOfToday],
          },
        }),
      },

      attributes: ["id", "title", "createdAt"],
      // order: [["createdAt", "DESC"]],

      // },
      include: [
        {
          model: todo_item,
          as: "todo_items",
          required: false,
          attributes: ["title", "status"],
        },
        {
          model: workspace,
          as: "workspace",
          required: false,
          attributes: ["id", "name"],
        },
      ],
    });
    res.json(_todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readTodo = async (req, res) => {
  try {
    const _todo = await todo.findByPk(req.params.id);
    if (_todo) {
      res.json(_todo);
    } else {
      res.status(404).json({ message: "Todo not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateTodo = async (req, res) => {
  try {
    const _todo = await todo.findByPk(req.params.id);
    if (_todo) {
      await _todo.update(req.body);
      const updatedTodo = { ..._todo.get() };
      res.json(updatedTodo);
    } else {
      res.status(404).json({ message: "Todo not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteTodo = async (req, res) => {
  try {
    const _todo = await todo.findByPk(req.params.id);
    if (_todo) {
      await _todo.destroy();
      res.json({ message: "Todo successfully deleted!" });
    } else {
      res.status(404).json({ message: "Todo not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTodo,
  readTodos,
  readTodosS,
  readTodo,
  updateTodo,
  deleteTodo,
};
