const { discussion, user, team_membership } = require("../models");
const presenceService = require("../services/presenceService");

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
      const limit = Math.min(
        Number.parseInt(req.query.limit || "20", 10) || 20,
        100
      );
      const before = req.query.before ? new Date(req.query.before) : null;
      const usePagination = req.query.paginate === "1";

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

      const sortThreadChronologically = (thread) => {
        thread.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        thread.forEach((item) => {
          if (Array.isArray(item.replies) && item.replies.length) {
            sortThreadChronologically(item.replies);
          }
        });
      };

      const discussionUserIds = _discussions.map((disc) => disc.user_id);
      const presenceByUserId = presenceService.getPresenceForUsers(discussionUserIds);

      const withPresence = _discussions.map((disc) => {
        const presence = presenceByUserId[String(disc.user_id)] || {};
        return {
          ...disc,
          user_presence: {
            is_online: Boolean(presence.is_online),
            is_active: Boolean(presence.is_active),
            last_seen_at: presence.last_seen_at || null,
          },
        };
      });

      const nestedDiscussions = buildNestedDiscussion(withPresence);
      // Ensure deterministic root order (newest first for pagination).
      nestedDiscussions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      nestedDiscussions.forEach((item) => {
        if (Array.isArray(item.replies) && item.replies.length) {
          sortThreadChronologically(item.replies);
        }
      });

      if (!usePagination) {
        return res.json(nestedDiscussions);
      }

      const filteredRoots = before
        ? nestedDiscussions.filter(
            (item) => new Date(item.createdAt).getTime() < before.getTime()
          )
        : nestedDiscussions;

      const pageItems = filteredRoots.slice(0, limit);
      const hasMore = filteredRoots.length > pageItems.length;
      const oldestLoaded = pageItems[pageItems.length - 1] || null;

      return res.json({
        items: pageItems,
        pagination: {
          hasMore,
          nextBefore: oldestLoaded ? oldestLoaded.createdAt : null,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: "team_id query is required" });
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
      const isOwner = String(_discussion.user_id) === String(req.user.id);
      let isTeamAdmin = false;

      if (!isOwner) {
        const adminMembership = await team_membership.findOne({
          where: {
            team_id: _discussion.team_id,
            user_id: req.user.id,
            role: "admin",
          },
        });
        isTeamAdmin = Boolean(adminMembership);
      }

      if (!isOwner && !isTeamAdmin) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Cannot edit this discussion" });
      }

      await _discussion.update({ content: req.body.content });
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
