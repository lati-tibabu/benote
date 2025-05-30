const {
  team,
  team_membership,
  user,
  team_membership_permission,
  workspace_membership,
  workspace,
} = require("../models");

// const { team, team_membership } = require('../models');
const { Sequelize, where } = require("sequelize");

const { sendNotification } = require("../services/notificationService");

const createTeam = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Team name is required" });
  }

  const transaction = await team.sequelize.transaction(); // Start a transaction

  try {
    // Create the team
    const _team = await team.create(
      { name, created_by: userId },
      { transaction }
    );

    // Assign the creator as an admin in the membership table
    const creatorMembership = await team_membership.create(
      {
        team_id: _team.id,
        user_id: userId,
        role: "admin",
        invitation_accepted: true,
      },
      { transaction }
    );

    // Give full permissions to the creator
    await team_membership_permission.create(
      {
        team_membership_id: creatorMembership.id,
        can_create_workspace: true,
        can_upload_files: true,
        can_participate_discussion: true,
        can_create_task: true,
        can_create_todo: true,
        can_create_roadmap: true,
        can_create_study_plan: true,
        can_create_notes: true,
        can_share_notes: true,
      },
      { transaction }
    );

    await transaction.commit(); // Commit transaction
    return res.status(201).json(_team);
  } catch (error) {
    await transaction.rollback(); // Rollback on failure

    if (error instanceof Sequelize.ValidationError) {
      return res
        .status(400)
        .json({ message: error.errors.map((e) => e.message) });
    }

    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const giveUserMembership = async (req, res) => {
  try {
    const _team = await team.findByPk(req.params.team_id);

    if (!_team) {
      return res.status(404).json({ message: "team not found" });
    }

    const is_member_and_admin = await team_membership.findOne({
      where: {
        team_id: req.params.team_id,
        user_id: req.user.id,
        role: "admin",
      },
    });

    if (!is_member_and_admin) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not an admin of this team" });
    }

    const _membership = await team_membership.create({
      team_id: req.params.team_id,
      user_id: req.body.user_id,
      role: "member",
    });

    // Create default permissions (all false) for this membership

    await team_membership_permission.create({
      team_membership_id: _membership.id,
      // All permissions default to false by model definition
    });

    // Send notification to the user being added

    res.status(201).json(_membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const promoteTeamAdmin = async (req, res) => {
  try {
    const teamId = req.params.team_id;
    const userId = req.user.id;

    const _team = await team.findByPk(teamId);

    if (!_team) {
      return res.json(404).json({ message: "team not found" });
    }
    const isTeamCreatedByUser = await team.findOne({
      where: {
        id: teamId,
        created_by: userId,
      },
    });

    const is_member_and_admin = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        role: "admin",
      },
    });

    if (!is_member_and_admin || !isTeamCreatedByUser) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not an admin of this team" });
    }

    const checkMembership = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: req.body.user_id,
      },
    });

    if (!checkMembership) {
      const _membership = await team_membership.create({
        team_id: teamId,
        user_id: req.body.user_id,
        role: "admin",
      });
      // Create permissions with all true for new admin
      await team_membership_permission.create({
        team_membership_id: _membership.id,
        can_create_workspace: true,
        can_upload_files: true,
        can_participate_discussion: true,
        can_create_task: true,
        can_create_todo: true,
        can_create_roadmap: true,
        can_create_study_plan: true,
        can_create_notes: true,
        can_share_notes: true,
      });
      res.status(201).json(_membership);
    } else {
      const _membership = await team_membership.update(
        {
          role: "admin",
        },
        {
          where: {
            team_id: teamId,
            user_id: req.body.user_id,
          },
        }
      );
      // Check if permission exists for this membership
      const member = await team_membership.findOne({
        where: {
          team_id: teamId,
          user_id: req.body.user_id,
        },
      });
      let permission = await team_membership_permission.findOne({
        where: { team_membership_id: member.id },
      });
      if (permission) {
        await team_membership_permission.update(
          {
            can_create_workspace: true,
            can_upload_files: true,
            can_participate_discussion: true,
            can_create_task: true,
            can_create_todo: true,
            can_create_roadmap: true,
            can_create_study_plan: true,
            can_create_notes: true,
            can_share_notes: true,
          },
          {
            where: { team_membership_id: member.id },
          }
        );
      } else {
        await team_membership_permission.create({
          team_membership_id: member.id,
          can_create_workspace: true,
          can_upload_files: true,
          can_participate_discussion: true,
          can_create_task: true,
          can_create_todo: true,
          can_create_roadmap: true,
          can_create_study_plan: true,
          can_create_notes: true,
          can_share_notes: true,
        });
      }
      res.status(200).json(_membership);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const demoteTeamAdmin = async (req, res) => {
  try {
    const teamId = req.params.team_id;
    const userId = req.user.id;

    const _team = await team.findByPk(teamId);

    if (!_team) {
      return res.json(404).json({ message: "team not found" });
    }

    const isTeamCreatedByUser = await team.findOne({
      where: {
        id: teamId,
        created_by: userId,
      },
    });

    const is_member_and_admin = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        role: "admin",
      },
    });

    if (!is_member_and_admin || !isTeamCreatedByUser) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not an admin of this team" });
    }

    const checkMembership = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: req.body.user_id,
        role: "admin",
      },
    });

    if (checkMembership && userId != req.body.user_id) {
      const _membership = await team_membership.update(
        {
          role: "member",
        },
        {
          where: {
            team_id: req.params.team_id,
            user_id: req.body.user_id,
          },
        }
      );
      // Remove all permissions for demoted admin
      const member = await team_membership.findOne({
        where: {
          team_id: req.params.team_id,
          user_id: req.body.user_id,
        },
      });
      if (member) {
        await team_membership_permission.update(
          {
            can_create_workspace: false,
            can_upload_files: false,
            can_participate_discussion: false,
            can_create_task: false,
            can_create_todo: false,
            can_create_roadmap: false,
            can_create_study_plan: false,
            can_create_notes: false,
            can_share_notes: false,
          },
          {
            where: { team_membership_id: member.id },
          }
        );
      }
      res.status(200).json(_membership);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const acceptMembershipInvitation = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;

    const isMemberAndInvitationNotAccepted = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        invitation_accepted: false,
      },
    });

    if (!isMemberAndInvitationNotAccepted) {
      return res
        .status(400)
        .json({ message: "User not member or invitation not exist" });
    }

    const _invitation = await team_membership.update(
      {
        invitation_accepted: true,
      },
      {
        where: {
          team_id: teamId,
          user_id: userId,
        },
      }
    );
    return res
      .status(200)
      .json({ invitation: _invitation, message: "invitation Accepted " });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const removeUserMember = async (req, res) => {
  try {
    const teamId = req.params.team_id;
    const userId = req.user.id;
    const targetUser = req.params.user_id;

    const _team = await team.findByPk(teamId);

    if (!_team) {
      return res.json(404).json({ message: "team not found" });
    }
    // const isTeamCreatedByUser = await team.findOne({
    //     where: {
    //         id: teamId,
    //         created_by: userId
    //     }
    // });

    const is_member_and_admin = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        role: "admin",
      },
    });

    if (!is_member_and_admin) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not an admin of this team" });
    }

    const checkMembership = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: targetUser,
        role: "member",
      },
    });

    if (!checkMembership)
      return res
        .status(400)
        .json({ message: "admin can only be removed by the owner" });

    await checkMembership.destroy();
    res.status(200).json({ message: "membership removed" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const readTeam = async (req, res) => {
  try {
    // const { team_id } = req.params;
    const team_id = req.params.id;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const isMember = await team_membership.findOne({
      where: {
        team_id: team_id,
        user_id: req.user.id,
        invitation_accepted: true,
      },
    });

    if (!isMember)
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not a member of this team" });

    const teamData = await team.findOne({
      where: { id: team_id },
      attributes: ["id", "name", "created_by", "createdAt"],
      include: [
        {
          model: team_membership,
          as: "memberships",
          attributes: ["role"],
          include: [
            {
              model: user,
              as: "user",
              attributes: ["id", "name", "email"],
              order: [["name", "ASC"]],
            },
            {
              model: team_membership_permission,
              as: "permission",
              attributes: [
                "can_create_workspace",
                "can_upload_files",
                "can_participate_discussion",
                "can_create_task",
                "can_create_todo",
                "can_create_roadmap",
                "can_create_study_plan",
                "can_create_notes",
                "can_share_notes",
              ],
            },
          ],
        },
      ],
    });

    if (!teamData) {
      return res.status(404).json({ message: "Team not found" });
    }

    const formattedTeam = {
      id: teamData.id,
      name: teamData.name,
      created_by: teamData.created_by,
      createdAt: teamData.createdAt,
      members: teamData.memberships.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        permissions: member.permission || null,
      })),
    };

    return res.status(200).json(formattedTeam);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const readTeams = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const memberships = await team_membership.findAll({
      attributes: ["role", "team_id"],
      where: { user_id: req.user.id, invitation_accepted: true },
      include: [
        {
          model: team,
          as: "team",
          attributes: ["id", "name", "created_by", "createdAt"],
          include: [
            {
              model: team_membership,
              as: "memberships",
              attributes: ["role"],
              include: [
                {
                  model: user,
                  as: "user",
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    // Format the response for better readability <--  this is all chatGPT idea - I swear I didn't write this
    const formattedTeams = memberships.map((membership) => ({
      role: membership.role,
      team: {
        id: membership.team.id,
        name: membership.team.name,
        created_by: membership.team.created_by,
        createdAt: membership.team.createdAt,
        members: membership.team.memberships.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
        })),
      },
    }));

    return res.status(200).json(formattedTeams);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;

    const _team = await team.findByPk(teamId);
    if (_team) {
      // const isTeamCreatedByUser = await team.findOne({
      //     where: {
      //         id: teamId,
      //         created_by: userId
      //     }
      // });
      const is_member_and_admin = await team_membership.findOne({
        where: {
          team_id: teamId,
          user_id: userId,
          role: "admin",
        },
      });

      if (!is_member_and_admin) {
        return res
          .status(401)
          .json({ message: "Unauthorized: You are not an admin of this team" });
      }

      await _team.update(req.body);
      const updatedTeam = { ..._team.get() };
      res.json(updatedTeam);
    } else {
      res.status(404).json({ message: "Team not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;

    const _team = await team.findByPk(teamId);

    if (!_team) {
      res.status(404).json({ message: "Team not found!" });
    } else {
      const isTeamCreatedByUser = await team.findOne({
        where: {
          id: teamId,
          created_by: userId,
        },
      });
      const is_member_and_admin = await team_membership.findOne({
        where: {
          team_id: teamId,
          user_id: userId,
          role: "admin",
        },
      });

      if (!is_member_and_admin || !isTeamCreatedByUser) {
        return res
          .status(401)
          .json({ message: "Unauthorized: You are not an admin of this team" });
      }

      await _team.destroy();
      res.json({ message: "Team deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeWorkspaceFromTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const workspaceId = req.body.workspace_id;

    const _team = await team.findByPk(teamId);

    if (!_team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isTeamCreatedByUser = await team.findOne({
      where: {
        id: teamId,
        created_by: req.user.id,
      },
    });

    isWorkspaceCreatedByUser = await workspace.findOne({
      where: {
        id: workspaceId,
        owned_by: req.user.id,
      },
    });

    if (!isTeamCreatedByUser) {
      if (!isWorkspaceCreatedByUser) {
        return res.status(401).json({
          message: "Unauthorized: You are not the creator of this workspace",
        });
      }
    }

    // if (!isTeamCreatedByUser && !isWorkspaceCreatedByUser) {
    //   return res.status(401).json({
    //     message: "Unauthorized: You are not the creator of this team",
    //   });
    // }

    // Check if the workspace belongs to the team
    const workspaceBelongsToTeam = await workspace.findOne({
      where: {
        id: workspaceId,
        belongs_to_team: teamId,
      },
    });

    if (!workspaceBelongsToTeam) {
      return res.status(404).json({ message: "Workspace not found in team" });
    }

    await workspaceBelongsToTeam.update({
      belongs_to_team: null, // Remove the association with the team
    });
    // Check if the workspace membership exists

    const workspaceMembershipExists = await workspace_membership.findOne({
      where: {
        team_id: teamId,
        workspace_id: workspaceId,
      },
    });

    if (!workspaceMembershipExists) {
      return res.status(404).json({ message: "Workspace not found in team" });
    }

    const workspaceMembership = await workspace_membership.findOne({
      where: {
        team_id: teamId,
        workspace_id: workspaceId,
      },
    });

    if (workspaceMembership) {
      await workspaceMembership.destroy();
    }
    // If you have a direct relationship in the team model, you might need to update that as well
    // For example, if you have a workspaces field in the team model:

    // Assuming you have a method to remove a workspace from a team
    // This is just a placeholder, implement your logic here
    // await _team.removeWorkspace(workspaceId);

    return res.status(200).json({ message: "Workspace removed from team" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const addWorkspaceToTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const workspaceId = req.body.workspace_id;
    const userId = req.user.id;

    // Check if team exists
    const _team = await team.findByPk(teamId);
    if (!_team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin or owner
    const isAdmin = await team_membership.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        role: "admin",
      },
    });
    if (!isAdmin || _team.created_by !== userId) {
      return res.status(401).json({
        message: "Unauthorized: You are not an admin or owner of this team",
      });
    }

    // Check if workspace exists
    const _workspace = await workspace.findByPk(workspaceId);
    if (!_workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Associate workspace with team
    await _workspace.update({ belongs_to_team: teamId });

    // Add workspace membership if not already present
    let workspaceMembership = await workspace_membership.findOne({
      where: {
        team_id: teamId,
        workspace_id: workspaceId,
      },
    });
    if (!workspaceMembership) {
      workspaceMembership = await workspace_membership.create({
        team_id: teamId,
        workspace_id: workspaceId,
      });
    }

    return res.status(200).json({ message: "Workspace added to team" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createTeam,
  readTeams,
  readTeam,
  updateTeam,
  deleteTeam,
  giveUserMembership,
  promoteTeamAdmin,
  demoteTeamAdmin,
  removeUserMember,
  acceptMembershipInvitation,
  removeWorkspaceFromTeam,
  addWorkspaceToTeam,
};
