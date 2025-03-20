const { mindmap_item } = require("../models");
const mindmapItemController = require("../controllers/mindmapItemControllers");

jest.mock("../models");

describe("Mindmap Item Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMindmapItem", () => {
    it("should create a new mindmap item", async () => {
      const req = { body: { content: "Test Mindmap Item" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createdMindmapItem = { id: 1, content: "Test Mindmap Item" };
      mindmap_item.create.mockResolvedValue(createdMindmapItem);

      await mindmapItemController.createMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMindmapItem);
    });

    it("should handle errors during mindmap item creation", async () => {
      const req = { body: { content: "Test Mindmap Item" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap_item.create.mockRejectedValue(error);

      await mindmapItemController.createMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readMindmapItems", () => {
    it("should retrieve all mindmap items", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const mindmapItems = [{ id: 1, content: "Mindmap Item 1" }];
      mindmap_item.findAll.mockResolvedValue(mindmapItems);

      await mindmapItemController.readMindmapItems(req, res);

      expect(res.json).toHaveBeenCalledWith(mindmapItems);
    });

    it("should handle errors during mindmap items retrieval", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap_item.findAll.mockRejectedValue(error);

      await mindmapItemController.readMindmapItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readMindmapItem", () => {
    it("should retrieve a specific mindmap item", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const singleMindmapItem = { id: 1, content: "Specific Mindmap Item" };
      mindmap_item.findByPk.mockResolvedValue(singleMindmapItem);

      await mindmapItemController.readMindmapItem(req, res);

      expect(mindmap_item.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(singleMindmapItem);
    });

    it("should handle not found error", async () => {
      const req = { params: { id: 999 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mindmap_item.findByPk.mockResolvedValue(null);

      await mindmapItemController.readMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mindmap item not found!",
      });
    });

    it("should handle errors during single mindmap item retrieval", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      mindmap_item.findByPk.mockRejectedValue(error);

      await mindmapItemController.readMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("updateMindmapItem", () => {
    it("should update an existing mindmap item", async () => {
      const req = {
        params: { id: 1 },
        body: { content: "Updated Mindmap Item" },
      };
      const res = { json: jest.fn() };
      const mockMindmapItem = {
        id: 1,
        content: "Original Content",
        update: jest
          .fn()
          .mockResolvedValue({ content: "Updated Mindmap Item" }),
        get: jest.fn(() => ({ id: 1, content: "Updated Mindmap Item" })),
      };
      mindmap_item.findByPk.mockResolvedValue(mockMindmapItem);

      await mindmapItemController.updateMindmapItem(req, res);

      expect(mindmap_item.findByPk).toHaveBeenCalledWith(1);
      expect(mockMindmapItem.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        content: "Updated Mindmap Item",
      });
    });

    it("should handle not found error during update", async () => {
      const req = {
        params: { id: 999 },
        body: { content: "Updated Mindmap Item" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mindmap_item.findByPk.mockResolvedValue(null);

      await mindmapItemController.updateMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mindmap item not found!",
      });
    });

    it("should handle errors during update", async () => {
      const req = {
        params: { id: 1 },
        body: { content: "Updated Mindmap Item" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockMindmapItem = {
        update: jest.fn().mockRejectedValue(error),
      };
      mindmap_item.findByPk.mockResolvedValue(mockMindmapItem);

      await mindmapItemController.updateMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("deleteMindmapItem", () => {
    it("should delete an existing mindmap item", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const mockMindmapItem = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      mindmap_item.findByPk.mockResolvedValue(mockMindmapItem);

      await mindmapItemController.deleteMindmapItem(req, res);

      expect(mindmap_item.findByPk).toHaveBeenCalledWith(1);
      expect(mockMindmapItem.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Mindmap item successfully deleted!",
      });
    });

    it("should handle not found error during delete", async () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mindmap_item.findByPk.mockResolvedValue(null);

      await mindmapItemController.deleteMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mindmap item not found!",
      });
    });

    it("should handle errors during delete", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockMindmapItem = { destroy: jest.fn().mockRejectedValue(error) };
      mindmap_item.findByPk.mockResolvedValue(mockMindmapItem);

      await mindmapItemController.deleteMindmapItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
