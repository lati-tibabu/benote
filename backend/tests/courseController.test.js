const { course } = require('../models');
const courseController = require('../controllers/courseControllers');

jest.mock('../models');

describe('Course Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCourse', () => {
        it('should create a new course', async () => {
            const req = { body: { title: 'Test Course' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const createdCourse = { id: 1, ...req.body };
            course.create.mockResolvedValue(createdCourse);

            await courseController.createCourse(req, res);

            expect(course.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdCourse);
        });

        it('should handle errors during course creation', async () => {
            const req = { body: { title: 'Error Course' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            course.create.mockRejectedValue(error);

            await courseController.createCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readCourses', () => {
        it('should retrieve all courses', async () => {
            const req = {};
            const res = { json: jest.fn() };
            const courses = [{ id: 1, title: 'Course A' }, { id: 2, title: 'Course B' }];
            course.findAll.mockResolvedValue(courses);

            await courseController.readCourses(req, res);

            expect(course.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(courses);
        });

        it('should handle errors during courses retrieval', async () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const error = new Error('Database error');
            course.findAll.mockRejectedValue(error);

            await courseController.readCourses(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('readCourse', () => {
        it('should retrieve a specific course', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };
            const specificCourse = { id: 1, title: 'Specific Course' };
            course.findByPk.mockResolvedValue(specificCourse);

            await courseController.readCourse(req, res);

            expect(course.findByPk).toHaveBeenCalledWith(req.params.id);
            expect(res.json).toHaveBeenCalledWith(specificCourse);
        });

        it('should handle course not found', async () => {
            const req = { params: { id: 99 } }; // Course ID that won't be found
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            course.findByPk.mockResolvedValue(null);

            await courseController.readCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'course not found!' });
        });
    });

    describe('updateCourse', () => {
        it('should update an existing course', async () => {
            const req = { params: { id: 1 }, body: { title: 'Updated Course Title' } };
            const res = { json: jest.fn() };

            // Mock the course instance and its methods
            const mockCourse = {
                update: jest.fn().mockResolvedValue({ id: 1, title: 'Updated Course Title' }),
                get: jest.fn(() => ({ id: 1, title: 'Updated Course Title' })),
            };

            course.findByPk.mockResolvedValue(mockCourse);

            await courseController.updateCourse(req, res);

            expect(course.findByPk).toHaveBeenCalledWith(req.params.id);
            expect(mockCourse.update).toHaveBeenCalledWith(req.body);
            expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Updated Course Title' });
        });

        it('should handle course not found for update', async () => {
            const req = { params: { id: 99 }, body: { title: 'Updated Course Title' } }; // Non-existent ID
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            course.findByPk.mockResolvedValue(null);

            await courseController.updateCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'course not found1' }); // Check for the correct message
        });
    });

    describe('deleteCourse', () => {
        it('should delete an existing course', async () => {
            const req = { params: { id: 1 } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            const mockCourseInstance = { destroy: jest.fn().mockResolvedValue(undefined) };
            course.findByPk.mockResolvedValue(mockCourseInstance);

            await courseController.deleteCourse(req, res);

            expect(course.findByPk).toHaveBeenCalledWith(req.params.id);
            expect(mockCourseInstance.destroy).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'course succesfully deleted' });
        });

        it('should handle course not found for deletion', async () => {
            const req = { params: { id: 99 } }; // Non-existent ID
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            course.findByPk.mockResolvedValue(null);

            await courseController.deleteCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'course not found' });
        });
    });
});

