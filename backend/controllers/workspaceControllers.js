const {
  workspace,
  workspace_membership,
  team_membership,
  user,
  task,
  todo,
  todo_item,
} = require("../models");
const { team } = require("../models");

// Create
const createWorkspace = async (req, res) => {
  try {
    const _workspace = await workspace.create(req.body);
    if (_workspace) {
      await workspace_membership.create({
        workspace_id: _workspace.id,
        // user_id: req.user.id,
        user_id: _workspace.owned_by,
        role: "admin",
      });
    }
    res.status(201).json(_workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// give user membership
const giveUserMembership = async (req, res) => {
  try {
    const { user_id, team_id, role } = req.body;
    const { id: workspace_id } = req.params;

    // Ensure at least one of user_id or team_id is provided
    if (!user_id && !team_id) {
      return res
        .status(400)
        .json({ message: "Either user_id or team_id is required" });
    }

    // Fetch workspace
    const _workspace = await workspace.findByPk(workspace_id);
    if (!_workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    let _user = null;
    let _team = null;

    // Validate user existence if provided
    if (user_id) {
      _user = await user.findByPk(user_id);
      if (!_user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Validate team existence if provided
    if (team_id) {
      _team = await team.findByPk(team_id);
      if (!_team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Ensure the workspace actually belongs to the given team
      // if (_workspace.belongs_to_team !== team_id) {
      //     return res.status(400).json({ message: "This team does not belong to the given workspace" });
      // }
    }

    // Check for duplicate membership before creating a new one
    const existingMembership = await workspace_membership.findOne({
      where: {
        workspace_id,
        user_id: user_id || null,
        team_id: team_id || null,
      },
    });

    if (existingMembership) {
      return res.status(409).json({ message: "Membership already exists" });
    }

    // Create workspace membership
    const _membership = await workspace_membership.create({
      workspace_id,
      user_id: user_id || null,
      team_id: team_id || null,
      role: role || "member",
    });

    res.status(201).json(_membership);
  } catch (error) {
    console.error("Error creating workspace membership:", error);
    res.status(500).json({ message: error.message });
  }
};

// Read
const readWorkspaces = async (req, res) => {
  try {
    const home = req.query.home;
    const userId = req.user.id;
    let _workspaces = null;

    if (!home) {
      _workspaces = await workspace_membership.findAll({
        attributes: ["role", "workspace_id"],
        where: {
          user_id: userId,
        },
        include: [
          {
            model: workspace,
            as: "workspace",
            required: true,
            include: [
              {
                model: team,
                as: "team",
                required: false,
              },
              {
                model: workspace_membership,
                as: "memberships",
                required: false,
                attributes: ["role"],
                include: [
                  {
                    model: user,
                    as: "user",
                    attributes: ["name", "email"],
                  },
                ],
              },
            ],
          },
        ],
        order: [
          [{ model: workspace, as: "workspace" }, "last_accessed_at", "DESC"],
        ],
      });
    } else {
      _workspaces = await workspace_membership.findAll({
        attributes: ["role", "workspace_id"],
        where: { user_id: userId },
        include: [
          {
            model: workspace,
            as: "workspace",
            required: true,
          },
        ],
        order: [
          [{ model: workspace, as: "workspace" }, "last_accessed_at", "DESC"],
        ],
        limit: 5,
      });
    }

    if (!_workspaces) return res.status(404).json("Workspace not found");

    res.json(_workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readWorkspacesData = async (req, res) => {
  try {
    const userId = req.user.id;
    const _workspaces = await workspace_membership.findAll({
      where: {
        user_id: userId,
      },
      attributes: [],
      include: [
        {
          model: workspace,
          as: "workspace",
          required: true,
          attributes: ["id", "emoji", "name", "description"],
          include: [
            {
              model: task,
              as: "tasks",
              required: false,
              attributes: [
                "id",
                "title",
                "description",
                "status",
                "due_date",
                "is_archived",
              ],
            },
            {
              model: todo,
              as: "todos",
              required: false,
              attributes: ["id", "title"],
              include: [
                {
                  model: todo_item,
                  as: "todo_items",
                  required: false,
                  attributes: ["id", "title", "status"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!_workspaces) {
      res.status(404).json({ message: "No workspaces found" });
    } else {
      res.json(_workspaces);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readWorkspaceOfTeam = async (req, res) => {
  try {
    const _workspaces = await workspace_membership.findAll({
      where: {
        role: "member",
      },
      attributes: ["workspace_id"],
      // attributes:[],
      include: [
        {
          model: workspace,
          attributes: ["name", "description", "emoji", "owned_by", "createdAt"],
          as: "workspace",
          required: true,
          where: {
            belongs_to_team: req.params.team_id,
          },
          include: [
            {
              model: user,
              as: "creator",
              required: false,
              attributes: ["name", "email"],
            },
          ],
        },
      ],
    });
    if (!_workspaces)
      return res.status(404).json({ message: "No workspaces found" });

    res.json(_workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readWorkspace = async (req, res) => {
  const userId = req.user.id;
  const workspaceId = req.params.id;

  try {
    // check membership of the user
    const directMembership = await workspace_membership.findOne({
      where: {
        user_id: userId,
        workspace_id: workspaceId,
      },
    });

    const userTeams = await team_membership.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["team_id"],
    });

    const team_membership_array = userTeams.map((team) => team.team_id);

    const teamMembership =
      team_membership_array.length > 0
        ? await workspace_membership.findOne({
            where: {
              workspace_id: workspaceId,
              team_id: team_membership_array,
            },
          })
        : null; // No team membership if the array is empty

    if (!directMembership && !teamMembership) {
      res
        .status(403)
        .json("Unauthorized, You are not a member of this workspace");
    } else {
      const _workspace = await workspace.findOne({
        where: {
          id: workspaceId,
        },
        include: [
          {
            model: user,
            as: "creator",
            attributes: ["name"],
          },
          {
            model: task,
            as: "tasks",
            required: false,
            attributes: ["status", "due_date"],
          },
        ],
      });

      if (!_workspace)
        return res.status(404).json({ message: "Workspace not found" });
      await _workspace.update({
        last_accessed_at: new Date(),
      });

      res.json(_workspace);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateWorkspace = async (req, res) => {
  try {
    const _workspace = await workspace.findByPk(req.params.id);
    if (_workspace) {
      const is_member_and_admin = await workspace_membership.findOne({
        where: {
          workspace_id: req.params.id,
          user_id: req.user.id,
          role: "admin",
        },
      });
      if (!is_member_and_admin) {
        return res
          .status(401)
          .json({ message: "You are not authorized to edit the workspace" });
      }
      await _workspace.update(req.body);
      const updatedWorkspace = { ..._workspace.get() };
      res.json(updatedWorkspace);
    } else {
      res.status(404).json({ message: "Workspace not found1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete

const deleteWorkspace = async (req, res) => {
  try {
    const _workspace = await workspace.findByPk(req.params.id);

    if (_workspace) {
      const is_member_and_admin = await workspace_membership.findOne({
        where: {
          workspace_id: req.params.id,
          user_id: req.user.id,
          role: "admin",
        },
      });

      if (is_member_and_admin) {
        await _workspace.destroy();
      } else {
        res
          .status(401)
          .json({
            message: "Unauthorized: You are not an admin of this workspace",
          });
      }
      res.json({ message: "Workspace succesfully deleted" });
    } else {
      res.status(404).json({ message: "Workspace not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkspace,
  readWorkspaces,
  readWorkspaceOfTeam,
  readWorkspace,
  giveUserMembership,
  updateWorkspace,
  deleteWorkspace,
  readWorkspacesData,
};
