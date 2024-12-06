const { classroom } = require('../models');
const classroomController = require('../controllers/classroomControllers');

jest.mock('../models');

describe('Classroom Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createClassroom', () => {
        it('should create a new classroom', async () => {
            const req = { body: { name: 'Test Classroom' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const createdClassroom = { id: 1, ...req.body };
            classroom.create.mockResolvedValue(createdClassroom);

            await classroomController.createClassroom(req, res);

            expect(classroom.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdClassroom);
        });

        it('should handle errors during classroom creation', async () => {
            const req = { body: { name: 'Error Classroom' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            classroom.create.mockRejectedValue(error);

            await classroomController.createClassroom(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readClassrooms', () => {
        it('should retrieve all classrooms', async () => {
            const req = {};
            const res = { json: jest.fn() };
            const classrooms = [{ id: 1, name: 'Classroom A' }, { id: 2, name: 'Classroom B' }];
            classroom.findAll.mockResolvedValue(classrooms);

            await classroomController.readClassrooms(req, res);

            expect(classroom.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(classrooms);
        });

        it('should handle errors during classrooms retrieval', async () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            classroom.findAll.mockRejectedValue(error);

            await classroomController.readClassrooms(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readClassroom', () => {
        it('should retrieve a specific classroom', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };
            const specificClassroom = { id: 1, name: 'Specific Classroom' };
            classroom.findByPk.mockResolvedValue(specificClassroom);

            await classroomController.readClassroom(req, res);

            expect(classroom.findByPk).toHaveBeenCalledWith(req.params.id); // Use req.params.id
            expect(res.json).toHaveBeenCalledWith(specificClassroom);
        });


        it('should handle classroom not found', async () => {
            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            classroom.findByPk.mockResolvedValue(null);

            await classroomController.readClassroom(req,res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({message: 'classroom not found!'}); // message matches controller

        });
    });


    describe('updateClassroom', () => {
        it('should update an existing classroom', async () => {
            const req = { params: { id: 1 }, body: { name: 'Updated Classroom Name' } };
            const res = { json: jest.fn() };
            const updatedClassroom = { id: 1, name: 'Updated Classroom Name' };

            const mockClassroom = {
                update: jest.fn().mockResolvedValue(updatedClassroom),
                get: jest.fn(() => updatedClassroom),
              };
              classroom.findByPk.mockResolvedValue(mockClassroom);

            await classroomController.updateClassroom(req, res);

            expect(classroom.findByPk).toHaveBeenCalledWith(req.params.id); // or req.params.id
            expect(mockClassroom.update).toHaveBeenCalledWith(req.body);
            expect(res.json).toHaveBeenCalledWith(updatedClassroom);


        });


        it('should handle classroom not found for update', async () => {

            const req = { params: {id: 99}, body: { name: 'Updated Name'} }; // Classroom ID that won't exist

            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            classroom.findByPk.mockResolvedValue(null);

            await classroomController.updateClassroom(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({message: 'classroom not found!'});

        })
    });

    describe('deleteClassroom', () => {

        it('should delete a classroom', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            const mockClassroom = { destroy: jest.fn() };
            classroom.findByPk.mockResolvedValue(mockClassroom);

            await classroomController.deleteClassroom(req, res);
            expect(classroom.findByPk).toHaveBeenCalledWith(req.params.id); // or req.params.id
            expect(mockClassroom.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'classroom deleted' });
        });


        it('should handle classroom not found for delete', async () => {
            const req = { params: { id: 99 } }; // classroom that doesn't exist
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            classroom.findByPk.mockResolvedValue(null);

            await classroomController.deleteClassroom(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'classroom not found!' });

        });
    });
});