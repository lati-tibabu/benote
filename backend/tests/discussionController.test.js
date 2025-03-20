const { discussion } = require("../models");
const discussionController = require("../controllers/discussionControllers");

jest.mock("../models");

describe("Discussion Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createDiscussion", () => {
    it("should create a new discussion", async () => {
      const req = { body: { title: "Test Discussion" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createdDiscussion = { id: 1, title: "Test Discussion" };
      discussion.create.mockResolvedValue(createdDiscussion);

      await discussionController.createDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdDiscussion);
    });

    it("should handle errors during discussion creation", async () => {
      const req = { body: { title: "Test Discussion" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      discussion.create.mockRejectedValue(error);

      await discussionController.createDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readDiscussions", () => {
    it("should retrieve all discussions", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const discussions = [{ id: 1, title: "Discussion 1" }];
      discussion.findAll.mockResolvedValue(discussions);

      await discussionController.readDiscussions(req, res);

      expect(res.json).toHaveBeenCalledWith(discussions);
    });

    it("should handle errors during discussions retrieval", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      discussion.findAll.mockRejectedValue(error);

      await discussionController.readDiscussions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readDiscussion", () => {
    it("should retrieve a specific discussion", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const singleDiscussion = { id: 1, title: "Specific Discussion" };
      discussion.findByPk.mockResolvedValue(singleDiscussion);

      await discussionController.readDiscussion(req, res);

      expect(discussion.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(singleDiscussion);
    });

    it("should handle not found error", async () => {
      const req = { params: { id: 999 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      discussion.findByPk.mockResolvedValue(null);

      await discussionController.readDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Discussion not found!",
      });
    });

    it("should handle errors during single discussion retrieval", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      discussion.findByPk.mockRejectedValue(error);

      await discussionController.readDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("updateDiscussion", () => {
    it("should update an existing discussion", async () => {
      const req = {
        params: { id: 1 },
        body: { title: "Updated Discussion" },
      };
      const res = { json: jest.fn() };
      const mockDiscussion = {
        id: 1,
        title: "Original Title",
        update: jest.fn().mockResolvedValue({ title: "Updated Discussion" }),
        get: jest.fn(() => ({ id: 1, title: "Updated Discussion" })),
      };
      discussion.findByPk.mockResolvedValue(mockDiscussion);

      await discussionController.updateDiscussion(req, res);

      expect(discussion.findByPk).toHaveBeenCalledWith(1);
      expect(mockDiscussion.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        title: "Updated Discussion",
      });
    });

    it("should handle not found error during update", async () => {
      const req = {
        params: { id: 999 },
        body: { title: "Updated Discussion" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      discussion.findByPk.mockResolvedValue(null);
      await discussionController.updateDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Discussion not found!",
      });
    });

    it("should handle errors during discussion update", async () => {
      const req = { params: { id: 1 }, body: { title: "Updated Discussion" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockDiscussion = {
        id: 1,
        title: "Test Discussion",
        update: jest.fn().mockRejectedValue(error),
      };
      discussion.findByPk.mockResolvedValue(mockDiscussion);

      await discussionController.updateDiscussion(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("deleteDiscussion", () => {
    it("should delete an existing discussion", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const mockDiscussion = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      discussion.findByPk.mockResolvedValue(mockDiscussion);

      await discussionController.deleteDiscussion(req, res);

      expect(discussion.findByPk).toHaveBeenCalledWith(1);
      expect(mockDiscussion.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Discussion successfully deleted!",
      });
    });

    it("should handle not found error during delete", async () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      discussion.findByPk.mockResolvedValue(null);

      await discussionController.deleteDiscussion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Discussion not found!",
      });
    });

    it("should handle errors during discussion deletion", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error("Database error");
      const mockDiscussion = { destroy: jest.fn().mockRejectedValue(error) };
      discussion.findByPk.mockResolvedValue(mockDiscussion);

      await discussionController.deleteDiscussion(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
