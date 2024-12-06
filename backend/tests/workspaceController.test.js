const { workspace } = require("../models");
const workspaceController = require("../controllers/workspaceControllers");

// Mock the workspace model
jest.mock("../models");

describe("Workspace Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createWorkspace", () => {
    it("should create a new workspace", async () => {
      const req = { body: { name: "Test Workspace" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createdWorkspace = { id: 1, name: "Test Workspace" };
      workspace.create.mockResolvedValue(createdWorkspace);

      await workspaceController.createWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdWorkspace);
    });

    it("should handle errors during workspace creation", async () => {
      const req = { body: { name: "Test Workspace" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      workspace.create.mockRejectedValue(error);

      await workspaceController.createWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe("readWorkspaces", () => {
    it("should retrieve all workspaces", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const workspaces = [{ id: 1, name: "Workspace 1" }];
      workspace.findAll.mockResolvedValue(workspaces);

      await workspaceController.readWorkspaces(req, res);

      expect(res.json).toHaveBeenCalledWith(workspaces);
    });

    it("should handle errors during workspace retrieval", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("Database error");
      workspace.findAll.mockRejectedValue(error);

      await workspaceController.readWorkspaces(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
  
  describe("readWorkspace", () => {
        it("should retrieve a specific workspace", async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };
            const singleWorkspace = { id: 1, name: "Specific Workspace" };
            workspace.findByPk.mockResolvedValue(singleWorkspace);

            await workspaceController.readWorkspace(req, res);

            expect(workspace.findByPk).toHaveBeenCalledWith(1); // Check if findByPk is called with the right ID.
            expect(res.json).toHaveBeenCalledWith(singleWorkspace);
        });


        it("should handle errors during single workspace retrieval", async () => {
            const req = { params: { id: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const error = new Error("Database error");
            workspace.findByPk.mockRejectedValue(error);

            await workspaceController.readWorkspace(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });

        })
  });

  describe("updateWorkspace", () => {
      it("should update an existing workspace", async () => {
          const req = {
              params: { id: 1 },
              body: { name: "Updated Workspace" },
          };
          const res = { json: jest.fn() };

          const mockWorkspace = {
              id: 1,
              name: 'Original Name',
              update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Workspace' }),
              // get: jest.fn().mockReturnThis()
              get: jest.fn(() => ({
                id: 1,
                name: 'Updated Workspace',
              }))
            };

            workspace.findByPk.mockResolvedValue(mockWorkspace);

          await workspaceController.updateWorkspace(req, res);

          expect(workspace.findByPk).toHaveBeenCalledWith(1);
          expect(mockWorkspace.update).toHaveBeenCalledWith(req.body); // Ensure update is called with the correct data
          expect(res.json).toHaveBeenCalledWith({ id: 1, name: "Updated Workspace" });
      });

      it("should handle not found error during update", async () => {
          const req = {
              params: { id: 999 }, // ID that doesn't exist
              body: { name: "Updated Workspace" },
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
          };
          workspace.findByPk.mockResolvedValue(null);

          await workspaceController.updateWorkspace(req, res);
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: "Workspace not found1" });
      });



      it("should handle errors during workspace update", async () => {
          const req = {
            params: { id: 1 },
            body: { name: "Updated Workspace" },
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
          const error = new Error("Database error");
          const mockWorkspace = {
              id: 1,
              name: "Test Workspace",
              update: jest.fn().mockRejectedValue(error)
            };
            workspace.findByPk.mockResolvedValue(mockWorkspace);
    
          await workspaceController.updateWorkspace(req, res);
    
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });


  });

  describe("deleteWorkspace", () => {
      it("should delete an existing workspace", async () => {
          const req = { params: { id: 1 } };
          const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

          const mockWorkspace = { destroy: jest.fn().mockResolvedValue(undefined) };
          workspace.findByPk.mockResolvedValue(mockWorkspace);

          await workspaceController.deleteWorkspace(req, res);

          expect(workspace.findByPk).toHaveBeenCalledWith(1);
          expect(mockWorkspace.destroy).toHaveBeenCalled();
          expect(res.json).toHaveBeenCalledWith({ message: "Workspace succesfully deleted" });
      });

      it("should handle not found error during delete", async () => {
          const req = { params: { id: 999 } }; // Provide an ID that is not expected to exist
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

          workspace.findByPk = jest.fn().mockResolvedValue(null);


          await workspaceController.deleteWorkspace(req,res)

          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: 'Workspace not found' });

        });


      it("should handle errors during workspace deletion", async () => {
          const req = { params: { id: 1 } };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
          };
          const error = new Error("Database Error");

          const mockWorkspace = { destroy: jest.fn().mockRejectedValue(error) };
          workspace.findByPk.mockResolvedValue(mockWorkspace);

          await workspaceController.deleteWorkspace(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: error.message });
      });
  });
  
});

