const { todo_item } = require("../models");

// Create
const createTodoItem = async (req, res) => {
  try {
    const todo = req.body;

    if (Array.isArray(todo?.tasks)) {
      // const todoItemsToCreate = todo?.tasks.map(task => ({
      //         status: task.status,
      //         title: task.title,
      //         todo_id: task.todo_id
      // }))

      const _todoItems = await todo_item.bulkCreate(todo?.tasks);

      if (_todoItems.length) {
        return res.status(201).json(_todoItems);
      } else {
        return res.status(400).json({ message: "Failed to create tasks." });
      }
    }

    const _todoItem = await todo_item.create(req.body);
    res.status(201).json(_todoItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readTodoItems = async (req, res) => {
  try {
    const todoListId = req.params.todo_id;
    const _todoItems = await todo_item.findAll({
      where: {
        todo_id: todoListId,
      },
      order: [["createdAt", "ASC"]],
    });
    res.json(_todoItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readTodoItem = async (req, res) => {
  try {
    const _todoItem = await todo_item.findByPk(req.params.id);
    if (_todoItem) {
      res.json(_todoItem);
    } else {
      res.status(404).json({ message: "Todo item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//patch done and undone todo

const checkUncheckTodoItem = async (req, res) => {
  try {
    const _todoItem = await todo_item.findByPk(req.params.id);
    if (!_todoItem) {
      return res.status(404).json({ message: "Todo item not found!" });
    }
    _todoItem.status = _todoItem.status === "done" ? "not_done" : "done";
    await _todoItem.save();
    res.json(_todoItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateTodoItem = async (req, res) => {
  try {
    const _todoItem = await todo_item.findByPk(req.params.id);
    if (_todoItem) {
      await _todoItem.update(req.body);
      const updatedTodoItem = { ..._todoItem.get() };
      res.json(updatedTodoItem);
    } else {
      res.status(404).json({ message: "Todo item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteTodoItem = async (req, res) => {
  try {
    const _todoItem = await todo_item.findByPk(req.params.id);
    if (_todoItem) {
      await _todoItem.destroy();
      res.json({ message: "Todo item successfully deleted!" });
    } else {
      res.status(404).json({ message: "Todo item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTodoItem,
  readTodoItems,
  readTodoItem,
  checkUncheckTodoItem,
  updateTodoItem,
  deleteTodoItem,
};
