const { roadmap } = require("../models");
const roadmapController = require("../controllers/roadmapControllers");

jest.mock("../models");

describe("Roadmap Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createRoadmap", () => {
    it("should create a new roadmap", async () => {
      const req = { body: { title: "Test Roadmap" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createdRoadmap = { id: 1, title: "Test Roadmap" };
      roadmap.create.mockResolvedValue(createdRoadmap);

      await roadmapController.createRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdRoadmap);
    });

    it("should handle errors during roadmap creation", async () => {
      const req = { body: { title: "Test Roadmap" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      roadmap.create.mockRejectedValue(error);

      await roadmapController.createRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readRoadmaps", () => {
    it("should retrieve all roadmaps", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const roadmaps = [{ id: 1, title: "Roadmap 1" }];
      roadmap.findAll.mockResolvedValue(roadmaps);

      await roadmapController.readRoadmaps(req, res);

      expect(res.json).toHaveBeenCalledWith(roadmaps);
    });

    it("should handle errors during roadmaps retrieval", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      roadmap.findAll.mockRejectedValue(error);

      await roadmapController.readRoadmaps(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readRoadmap", () => {
    it("should retrieve a specific roadmap", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const singleRoadmap = { id: 1, title: "Specific Roadmap" };
      roadmap.findByPk.mockResolvedValue(singleRoadmap);

      await roadmapController.readRoadmap(req, res);

      expect(roadmap.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(singleRoadmap);
    });

    it("should handle not found error", async () => {
      const req = { params: { id: 999 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      roadmap.findByPk.mockResolvedValue(null);

      await roadmapController.readRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Roadmap not found!" });
    });

    it("should handle errors during single roadmap retrieval", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      roadmap.findByPk.mockRejectedValue(error);

      await roadmapController.readRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("updateRoadmap", () => {
    it("should update an existing roadmap", async () => {
      const req = { params: { id: 1 }, body: { title: "Updated Roadmap" } };
      const res = { json: jest.fn() };
      const mockRoadmap = {
        id: 1,
        title: "Original Title",
        update: jest.fn().mockResolvedValue({ title: "Updated Roadmap" }),
        get: jest.fn(() => ({ id: 1, title: "Updated Roadmap" })),
      };
      roadmap.findByPk.mockResolvedValue(mockRoadmap);

      await roadmapController.updateRoadmap(req, res);

      expect(roadmap.findByPk).toHaveBeenCalledWith(1);
      expect(mockRoadmap.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        title: "Updated Roadmap",
      });
    });

    it("should handle not found error during update", async () => {
      const req = { params: { id: 999 }, body: { title: "Updated Roadmap" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      roadmap.findByPk.mockResolvedValue(null);
      await roadmapController.updateRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Roadmap not found!" });
    });

    it("should handle errors during update", async () => {
      const req = { params: { id: 1 }, body: { title: "Updated Roadmap" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockRoadmap = {
        update: jest.fn().mockRejectedValue(error),
      };
      roadmap.findByPk.mockResolvedValue(mockRoadmap);

      await roadmapController.updateRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("deleteRoadmap", () => {
    it("should delete an existing roadmap", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const mockRoadmap = { destroy: jest.fn().mockResolvedValue(undefined) };
      roadmap.findByPk.mockResolvedValue(mockRoadmap);

      await roadmapController.deleteRoadmap(req, res);

      expect(roadmap.findByPk).toHaveBeenCalledWith(1);
      expect(mockRoadmap.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Roadmap successfully deleted!",
      });
    });

    it("should handle not found error during delete", async () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      roadmap.findByPk.mockResolvedValue(null);

      await roadmapController.deleteRoadmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Roadmap not found!" });
    });

    it("should handle errors during roadmap deletion", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockRoadmap = { destroy: jest.fn().mockRejectedValue(error) };
      roadmap.findByPk.mockResolvedValue(mockRoadmap);

      await roadmapController.deleteRoadmap(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
