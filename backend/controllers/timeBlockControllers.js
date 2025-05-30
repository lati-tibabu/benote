const { where } = require("sequelize");
const { time_block } = require("../models");

// Create
const createTimeBlock = async (req, res) => {
  try {
    let timeBlocks = req.body;
    // Support both single object and array
    if (!Array.isArray(timeBlocks)) {
      timeBlocks = [timeBlocks];
    }
    const createdBlocks = [];
    for (const block of timeBlocks) {
      const start_time = new Date(block.start_time).getTime().toString();
      const end_time = new Date(block.end_time).getTime().toString();
      const title = start_time + end_time;
      const _timeBlock = await time_block.create({ ...block, title });
      createdBlocks.push(_timeBlock);
    }
    res
      .status(201)
      .json(Array.isArray(req.body) ? createdBlocks : createdBlocks[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readTimeBlocks = async (req, res) => {
  // const { user_id } = req.user;
  const userId = req.user.id;
  try {
    const _timeBlocks = await time_block.findAll({
      where: { user_id: userId },
      order: [["start_time", "ASC"]],
    });
    res.json(_timeBlocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readTimeBlock = async (req, res) => {
  try {
    const _timeBlock = await time_block.findByPk(req.params.id);
    if (_timeBlock) {
      res.json(_timeBlock);
    } else {
      res.status(404).json({ message: "Time block not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateTimeBlock = async (req, res) => {
  try {
    const _timeBlock = await time_block.findByPk(req.params.id);
    if (_timeBlock) {
      await _timeBlock.update(req.body);
      const updatedTimeBlock = { ..._timeBlock.get() };
      res.json(updatedTimeBlock);
    } else {
      res.status(404).json({ message: "Time block not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// patch

const patchTimeBlock = async (req, res) => {
  try {
    const _timeBlock = await time_block.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (_timeBlock) {
      await _timeBlock.update({
        job: req.body.job,
      });
      const updatedTimeBlock = { ..._timeBlock.get() };
      res.json(updatedTimeBlock);
    } else {
      res.status(404).json({ message: "Time block not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteTimeBlock = async (req, res) => {
  try {
    const _timeBlock = await time_block.findByPk(req.params.id);
    if (_timeBlock) {
      await _timeBlock.destroy();
      res.json({ message: "Time block successfully deleted!" });
    } else {
      res.status(404).json({ message: "Time block not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTimeBlock,
  readTimeBlocks,
  readTimeBlock,
  updateTimeBlock,
  patchTimeBlock,
  deleteTimeBlock,
};
