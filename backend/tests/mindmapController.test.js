const { mindmap } = require("../models");
const mindmapController = require("../controllers/mindmapControllers");

jest.mock("../models");

describe("Mindmap Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMindmap", () => {
    it("should create a new mindmap", async () => {
      const req = { body: { title: "Test Mindmap" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createdMindmap = { id: 1, title: "Test Mindmap" };
      mindmap.create.mockResolvedValue(createdMindmap);

      await mindmapController.createMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMindmap);
    });

    it("should handle errors during mindmap creation", async () => {
      const req = { body: { title: "Test Mindmap" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap.create.mockRejectedValue(error);

      await mindmapController.createMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readMindmaps", () => {
    it("should retrieve all mindmaps", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const mindmaps = [{ id: 1, title: "Mindmap 1" }];
      mindmap.findAll.mockResolvedValue(mindmaps);

      await mindmapController.readMindmaps(req, res);

      expect(res.json).toHaveBeenCalledWith(mindmaps);
    });

    it("should handle errors during mindmaps retrieval", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap.findAll.mockRejectedValue(error);

      await mindmapController.readMindmaps(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readMindmap", () => {
    it("should retrieve a specific mindmap", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const singleMindmap = { id: 1, title: "Specific Mindmap" };
      mindmap.findByPk.mockResolvedValue(singleMindmap);

      await mindmapController.readMindmap(req, res);

      expect(mindmap.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(singleMindmap);
    });

    it("should handle not found error", async () => {
      const req = { params: { id: 999 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mindmap.findByPk.mockResolvedValue(null);

      await mindmapController.readMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Mindmap not found!" });
    });

    it("should handle errors during single mindmap retrieval", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap.findByPk.mockRejectedValue(error);

      await mindmapController.readMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("updateMindmap", () => {
    it("should update an existing mindmap", async () => {
      const req = { params: { id: 1 }, body: { title: "Updated Mindmap" } };
      const res = { json: jest.fn() };
      const mockMindmap = {
        id: 1,
        title: "Original Title",
        update: jest.fn().mockResolvedValue({ title: "Updated Mindmap" }),
        get: jest.fn(() => ({ id: 1, title: "Updated Mindmap" })), // Mock the return of the get method to include updated title
      };
      mindmap.findByPk.mockResolvedValue(mockMindmap);

      await mindmapController.updateMindmap(req, res);
      expect(mindmap.findByPk).toHaveBeenCalledWith(1);
      expect(mockMindmap.update).toHaveBeenCalledWith(req.body); // Verify update is called with request body
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        title: "Updated Mindmap",
      });
    });

    it("should handle not found error during update", async () => {
      const req = { params: { id: 999 }, body: { title: "Updated Mindmap" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mindmap.findByPk.mockResolvedValue(null);
      await mindmapController.updateMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Mindmap not found!" });
    });

    it("should handle errors during update", async () => {
      const req = { params: { id: 1 }, body: { title: "Updated Mindmap" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockMindmap = {
        update: jest.fn().mockRejectedValue(error),
      };
      mindmap.findByPk.mockResolvedValue(mockMindmap);

      await mindmapController.updateMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("deleteMindmap", () => {
    it("should delete an existing mindmap", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const mockMindmap = { destroy: jest.fn().mockResolvedValue(undefined) };
      mindmap.findByPk.mockResolvedValue(mockMindmap);

      await mindmapController.deleteMindmap(req, res);

      expect(mindmap.findByPk).toHaveBeenCalledWith(1);
      expect(mockMindmap.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Mindmap successfully deleted!",
      });
    });

    it("should handle not found error during delete", async () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mindmap.findByPk.mockResolvedValue(null);

      await mindmapController.deleteMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Mindmap not found!" });
    });

    it("should handle errors during mindmap deletion", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockMindmap = { destroy: jest.fn().mockRejectedValue(error) };
      mindmap.findByPk.mockResolvedValue(mockMindmap);

      await mindmapController.deleteMindmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
