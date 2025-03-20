const {
  workspace,
  workspace_membership,
  team,
  user,
  task,
  todo,
  todo_item,
  team_membership,
} = require("../models");
const {
  createWorkspace,
  readWorkspaces,
  readWorkspaceOfTeam,
  readWorkspace,
  giveUserMembership,
  updateWorkspace,
  deleteWorkspace,
  readWorkspacesData,
} = require("../controllers/workspaceController");
const { Op } = require("sequelize");

describe("Workspace Controller", () => {
  let testUser, testWorkspace, testTeam;

  beforeEach(async () => {
    testUser = await user.create({
      name: "Test User",
      email: "test@example.com",
    });
    testTeam = await team.create({ name: "Test Team" });
  });

  afterEach(async () => {
    await workspace.destroy({ where: {} });
    await workspace_membership.destroy({ where: {} });
    await team.destroy({ where: {} });
    await user.destroy({ where: {} });
    await task.destroy({ where: {} });
    await todo.destroy({ where: {} });
    await todo_item.destroy({ where: {} });
    await team_membership.destroy({ where: {} });
  });

  describe("createWorkspace", () => {
    it("should create a new workspace and add the user as an admin", async () => {
      const req = {
        body: {
          name: "Test Workspace",
          owned_by: testUser.id,
          emoji: ":smile:",
        },
        user: testUser,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Workspace",
          owned_by: testUser.id,
        })
      );

      const createdWorkspace = await workspace.findOne({
        where: { name: "Test Workspace" },
      });
      expect(createdWorkspace).toBeDefined();
      const membership = await workspace_membership.findOne({
        where: {
          workspace_id: createdWorkspace.id,
          user_id: testUser.id,
          role: "admin",
        },
      });
      expect(membership).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      const req = { body: { name: "Test Workspace", owned_by: null } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("giveUserMembership", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
      });
    });

    it("should give a user membership to a workspace", async () => {
      const req = {
        body: { user_id: testUser.id, role: "member" },
        params: { id: testWorkspace.id },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await giveUserMembership(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const membership = await workspace_membership.findOne({
        where: { workspace_id: testWorkspace.id, user_id: testUser.id },
      });
      expect(membership).toBeDefined();
    });

    it("should give a team membership to a workspace", async () => {
      const req = {
        body: { team_id: testTeam.id, role: "member" },
        params: { id: testWorkspace.id },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await giveUserMembership(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const membership = await workspace_membership.findOne({
        where: { workspace_id: testWorkspace.id, team_id: testTeam.id },
      });
      expect(membership).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      const req = { body: {}, params: { id: testWorkspace.id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await giveUserMembership(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      const req2 = {
        body: { user_id: 12345 },
        params: { id: testWorkspace.id },
      };
      const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await giveUserMembership(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(404);
    });
  });

  describe("readWorkspaces", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: "admin",
      });
    });

    it("should return all workspaces for a user", async () => {
      const req = { user: testUser, query: {} };
      const res = { json: jest.fn() };
      await readWorkspaces(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return only home workspaces if specified", async () => {
      const req = { user: testUser, query: { home: true } };
      const res = { json: jest.fn() };
      await readWorkspaces(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const req = { user: testUser, query: { home: "true" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await readWorkspaces(req, res);
    });
  });

  describe("readWorkspacesData", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
        emoji: ":smile:",
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: "admin",
      });
    });

    it("should return workspace data with tasks and todos", async () => {
      const req = { user: testUser };
      const res = { json: jest.fn() };
      await readWorkspacesData(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle cases where no workspaces are found", async () => {
      await workspace_membership.destroy({ where: { user_id: testUser.id } });
      const req = { user: testUser };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await readWorkspacesData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("readWorkspaceOfTeam", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
        belongs_to_team: testTeam.id,
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        team_id: testTeam.id,
        role: "member",
      });
    });

    it("should return workspaces for a given team", async () => {
      const req = { params: { team_id: testTeam.id } };
      const res = { json: jest.fn() };
      await readWorkspaceOfTeam(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle cases where no workspaces are found", async () => {
      const req = { params: { team_id: 9999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await readWorkspaceOfTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("readWorkspace", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: "admin",
      });
    });

    it("should return a workspace if the user is a member", async () => {
      const req = { params: { id: testWorkspace.id }, user: testUser };
      const res = { json: jest.fn() };
      await readWorkspace(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 403 if the user is not a member", async () => {
      const anotherUser = await user.create({
        name: "Another User",
        email: "another@example.com",
      });
      const req = { params: { id: testWorkspace.id }, user: anotherUser };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await readWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should handle workspace not found", async () => {
      const req = { params: { id: 9999 }, user: testUser };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await readWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("updateWorkspace", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: "admin",
      });
    });

    it("should update a workspace if the user is an admin", async () => {
      const req = {
        params: { id: testWorkspace.id },
        body: { name: "Updated Workspace" },
        user: testUser,
      };
      const res = { json: jest.fn() };
      await updateWorkspace(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Updated Workspace" })
      );
    });

    it("should return 401 if the user is not an admin", async () => {
      const anotherUser = await user.create({
        name: "Another User",
        email: "another@example.com",
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: anotherUser.id,
        role: "member",
      });
      const req = {
        params: { id: testWorkspace.id },
        body: { name: "Updated Workspace" },
        user: anotherUser,
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await updateWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should handle workspace not found", async () => {
      const req = {
        params: { id: 9999 },
        body: { name: "Updated Workspace" },
        user: testUser,
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await updateWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteWorkspace", () => {
    beforeEach(async () => {
      testWorkspace = await workspace.create({
        name: "Test Workspace",
        owned_by: testUser.id,
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: "admin",
      });
    });

    it("should delete a workspace if the user is an admin", async () => {
      const req = { params: { id: testWorkspace.id }, user: testUser };
      const res = { json: jest.fn() };
      await deleteWorkspace(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Workspace succesfully deleted",
      });
      const deletedWorkspace = await workspace.findByPk(testWorkspace.id);
      expect(deletedWorkspace).toBeNull();
    });

    it("should return 401 if the user is not an admin", async () => {
      const anotherUser = await user.create({
        name: "Another User",
        email: "another@example.com",
      });
      await workspace_membership.create({
        workspace_id: testWorkspace.id,
        user_id: anotherUser.id,
        role: "member",
      });
      const req = { params: { id: testWorkspace.id }, user: anotherUser };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await deleteWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should handle workspace not found", async () => {
      const req = { params: { id: 9999 }, user: testUser };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await deleteWorkspace(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
