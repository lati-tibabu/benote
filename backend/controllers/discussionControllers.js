const { discussion, user } = require("../models");

// Create
const createDiscussion = async (req, res) => {
  try {
    // const userId = req.user.id;
    const discussionBody = {
      content: req.body.content,
      team_id: req.body.team_id,
      discussion_id: req.body.discussion_id || null,
      user_id: req.user.id,
    };
    const _discussion = await discussion.create(discussionBody);
    res.status(201).json(_discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readDiscussions = async (req, res) => {
  if (req.query.team_id) {
    try {
      const _discussions = await discussion.findAll({
        where: {
          team_id: req.query.team_id,
        },
        raw: true,
        include: [
          {
            model: user,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      const buildNestedDiscussion = (discussions) => {
        const discussionMap = new Map();

        discussions.forEach((disc) => {
          discussionMap.set(disc.id, { ...disc, replies: [] });
        });

        const rootDiscussions = [];

        discussions.forEach((disc) => {
          if (disc.discussion_id) {
            const parent = discussionMap.get(disc.discussion_id);

            if (parent) {
              parent.replies.push(discussionMap.get(disc.id));
            }
          } else {
            rootDiscussions.push(discussionMap.get(disc.id));
          }
        });
        return rootDiscussions;
      };

      const nestedDiscussions = buildNestedDiscussion(_discussions);

      res.json(nestedDiscussions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Read one
const readDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findByPk(req.params.id);
    if (_discussion) {
      res.json(_discussion);
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findByPk(req.params.id);
    if (_discussion) {
      await _discussion.update(req.body);
      const updatedDiscussion = { ..._discussion.get() };
      res.json(updatedDiscussion);
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findOne(
      {
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      }
      // ,}
      // req.params.id
    );
    if (_discussion) {
      await _discussion.destroy();
      res.json({ message: "Discussion successfully deleted!" });
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscussion,
  readDiscussions,
  readDiscussion,
  updateDiscussion,
  deleteDiscussion,
};
