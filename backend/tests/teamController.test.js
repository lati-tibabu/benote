const { team } = require("../models");
const teamController = require("../controllers/teamControllers");

jest.mock("../models"); // This mocks the entire models directory

describe("Team Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTeam", () => {
    it("should create a new team", async () => {
      const req = { body: { name: "Test Team", description: "A test team" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const createdTeam = { id: 1, ...req.body };
      team.create.mockResolvedValue(createdTeam);

      await teamController.createTeam(req, res);

      expect(team.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdTeam);
    });

    it("should handle errors during team creation", async () => {
      const req = { body: { name: "Error Team" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      team.create.mockRejectedValue(error);

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readTeams", () => {
    it("should retrieve all teams", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const teams = [
        { id: 1, name: "Team A" },
        { id: 2, name: "Team B" },
      ];
      team.findAll.mockResolvedValue(teams);

      await teamController.readTeams(req, res);

      expect(team.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(teams);
    });

    it("should handle errors during teams retrieval", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      team.findAll.mockRejectedValue(error);

      await teamController.readTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readTeam", () => {
    it("should retrieve a specific team", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const specificTeam = { id: 1, name: "Specific Team" };
      team.findByPk.mockResolvedValue(specificTeam);

      await teamController.readTeam(req, res);

      expect(team.findByPk).toHaveBeenCalledWith(req.params.id);
      expect(res.json).toHaveBeenCalledWith(specificTeam);
    });

    it("should handle team not found", async () => {
      const req = { params: { id: 99 } };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      team.findByPk.mockResolvedValue(null);

      await teamController.readTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Team not found!" });
    });
  });

  describe("updateTeam", () => {
    it("should update an existing team", async () => {
      const req = {
        params: { id: 1 },
        body: {
          name: "Updated team name",
          description: "Updated team description",
        },
      };
      const res = { json: jest.fn() };
      const mockTeamInstance = {
        id: 1,
        name: "Original Team name",
        description: "Original team description",
        update: jest.fn().mockResolvedValue({
          id: 1,
          name: "Updated team name",
          description: "Updated team description",
        }),
        get: jest.fn(() => ({
          id: 1,
          name: "Updated team name",
          description: "Updated team description",
        })),
      };
      team.findByPk.mockResolvedValue(mockTeamInstance);
      await teamController.updateTeam(req, res);

      expect(team.findByPk).toHaveBeenCalledWith(1);
      expect(mockTeamInstance.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: "Updated team name",
        description: "Updated team description",
      });
    });

    it("should handle errors during team update", async () => {
      const req = { params: { id: 1 }, body: { name: "Updated team name" } };
      const res = { status: jest.fn(() => res), json: jest.fn() };
      const error = new Error("Some error occurred during update.");
      const mockTeamInstance = {
        update: jest.fn(() => {
          throw error;
        }),
      };
      team.findByPk.mockResolvedValue(mockTeamInstance);
      await teamController.updateTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("deleteTeam", () => {
    it("should delete a team successfully", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const mockTeamInstance = {
        destroy: jest.fn().mockResolvedValue(undefined),
      }; // Mock the destroy function
      team.findByPk.mockResolvedValue(mockTeamInstance);

      await teamController.deleteTeam(req, res);

      expect(team.findByPk).toHaveBeenCalledWith(1); // Check if findByPk was called with the correct ID
      expect(mockTeamInstance.destroy).toHaveBeenCalledTimes(1); // Check if destroy was called once
      expect(res.json).toHaveBeenCalledWith({ message: "Team deleted" });
    });

    it("should handle team not found for deletion", async () => {
      const req = { params: { id: 99 } }; // Team ID that won't be found
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock findByPk to return null, simulating a team not found
      team.findByPk.mockResolvedValue(null);
      await teamController.deleteTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Team not found!" });
    });
  });
});
