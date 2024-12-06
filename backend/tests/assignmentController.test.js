const { assignment } = require('../models');
const assignmentController = require('../controllers/assignmentControllers');

jest.mock('../models');

describe('Assignment Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAssignment', () => {
        it('should create a new assignment', async () => {
            const req = { body: { title: 'Test Assignment' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const createdAssignment = { id: 1, ...req.body };
            assignment.create.mockResolvedValue(createdAssignment);

            await assignmentController.createAssignment(req, res);

            expect(assignment.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdAssignment);
        });

        it('should handle errors during assignment creation', async () => {
            const req = { body: { title: 'Error Assignment' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            assignment.create.mockRejectedValue(error);

            await assignmentController.createAssignment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readAssignments', () => {
        it('should retrieve all assignments', async () => {
            const req = {};
            const res = { json: jest.fn() };
            const assignments = [{ id: 1, title: 'Assignment A' }, { id: 2, title: 'Assignment B' }];
            assignment.findAll.mockResolvedValue(assignments);

            await assignmentController.readAssignments(req, res);

            expect(assignment.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(assignments);
        });

        it('should handle errors during assignments retrieval', async () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            assignment.findAll.mockRejectedValue(error);

            await assignmentController.readAssignments(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readAssignment', () => {
        it('should retrieve a specific assignment', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };
            const specificAssignment = { id: 1, title: 'Specific Assignment' };
            assignment.findByPk.mockResolvedValue(specificAssignment);

            await assignmentController.readAssignment(req, res);

            expect(assignment.findByPk).toHaveBeenCalledWith(req.params.id);
            expect(res.json).toHaveBeenCalledWith(specificAssignment);
        });

        it('should handle assignment not found', async () => {
            const req = { params: { id: 99 } }; // Assignment ID that won't be found
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            assignment.findByPk.mockResolvedValue(null);

            await assignmentController.readAssignment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'assignment not found!' });
        });
    });

    describe('updateAssignment', () => {
        it('should update an existing assignment', async () => {
            const req = { params: { id: 1 }, body: { title: 'Updated Assignment Title' } };
            const res = { json: jest.fn() };

             const mockAssignment = {
                update: jest.fn().mockResolvedValue({ id: 1, title: 'Updated Assignment Title'}),
                get: jest.fn(() => ({ id: 1, title: 'Updated Assignment Title'})),
            };
            assignment.findByPk.mockResolvedValue(mockAssignment);



            await assignmentController.updateAssignment(req, res);

            expect(assignment.findByPk).toHaveBeenCalledWith(req.params.id); // '1' because req.params.id is a string
            expect(mockAssignment.update).toHaveBeenCalledWith(req.body);
            expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Updated Assignment Title' });


        });

        it('should handle assignment not found for update', async () => {
            const req = { params: { id: 99 }, body: { title: 'Updated Assignment Title' } }; // Non-existent ID
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            assignment.findByPk.mockResolvedValue(null);

            await assignmentController.updateAssignment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'assignment not found1' }); // Check the correct message

        });
    });

    describe('deleteAssignment', () => {
        it('should delete an existing assignment', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            
            const mockAssignmentInstance = { destroy: jest.fn().mockResolvedValue(undefined) };
            assignment.findByPk.mockResolvedValue(mockAssignmentInstance);

            await assignmentController.deleteAssignment(req, res);

            expect(assignment.findByPk).toHaveBeenCalledWith(req.params.id);
            expect(mockAssignmentInstance.destroy).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'assignment succesfully deleted' });
        });

        it('should handle assignment not found for deletion', async () => {
            const req = { params: { id: 99 } }; // Non-existent ID
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            assignment.findByPk.mockResolvedValue(null);

            await assignmentController.deleteAssignment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'assignment not found' });


        });
    });
});

