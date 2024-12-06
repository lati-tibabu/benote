const bcrypt = require("bcryptjs");
const userController = require('../controllers/userControllers');
const { user } = require('../models'); // Adjust path as needed

jest.mock("../models"); // Mock the user model

describe('User Controller', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should create a new user', async () => {
        const req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        bcrypt.genSalt = jest.fn().mockResolvedValue('salt');
        bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
        user.create = jest.fn().mockResolvedValue({ 
            id: 'someGeneratedUUID',
            ...req.body, 
            password_hash: 'hashedPassword' 
        });

        await userController.createUser(req, res);

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
        expect(user.create).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'hashedPassword'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({  // Use objectContaining for partial match
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'hashedPassword'
        }));
    });

    it('should handle errors during user creation', async () => {
        const req = { body: {} }; // Simulate missing data which might cause an error
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        user.create = jest.fn().mockRejectedValue(new Error('Database error'));

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should read all users', async () => {
        const res = {
            json: jest.fn()
        };
        const mockUsers = [{ id: 1 }, { id: 2 }];
        user.findAll = jest.fn().mockResolvedValue(mockUsers);

        await userController.readUsers(null, res);

        expect(user.findAll).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should read a single user', async () => {
        const req = { params: { id: '123' } };
        const res = { json: jest.fn() };
        const mockUser = { id: '123', name: 'Test User' };
        user.findByPk = jest.fn().mockResolvedValue(mockUser);

        await userController.readUser(req, res);

        expect(user.findByPk).toHaveBeenCalledWith('123');
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should update a user', async () => {
        const req = {
            params: { id: '123' },
            body: { name: 'Updated Name' }
        };
        const res = { 
            json: jest.fn(), 
            status: jest.fn().mockReturnThis() 
        };
    
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            update: jest.fn().mockImplementation(function (updateData) {
                Object.assign(this, updateData); 
                return Promise.resolve(this);
            }),
            get: jest.fn().mockReturnValue({ id: '123', name: 'Updated Name' }) // Mock the `get` method
        };
    
        user.findByPk = jest.fn().mockResolvedValue(mockUser);
        
        await userController.updateUser(req, res);
    
        expect(user.findByPk).toHaveBeenCalledWith('123');
        expect(mockUser.update).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith({ id: '123', name: 'Updated Name' });
    });
    

    it('should delete a user', async () => {
        const req = { params: { id: '123' } };
        const res = { json: jest.fn() };
        const mockUser = { id: '123', destroy: jest.fn().mockResolvedValue(undefined) }; // Mock destroy function
        user.findByPk = jest.fn().mockResolvedValue(mockUser);

        await userController.deleteUser(req, res);

        expect(user.findByPk).toHaveBeenCalledWith('123');
        expect(mockUser.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted!' });
    });


    //Tests for when user is not found. updateUser and deleteUser utilize this
    it('should return 404 if user is not found - Update', async () => {
        const req = {
          params: { id: 'NonExistentId' },
          body: { name: 'Updated Name'}
        }
        const res = { 
            status: jest.fn().mockReturnThis(),
            json: jest.fn() 
        };
        user.findByPk = jest.fn().mockResolvedValue(null);
        
        await userController.updateUser(req,res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' });
    });

    it('should return 404 if user is not found - Delete', async () => {
        const req = { params: { id: 'NonExistentID' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        user.findByPk = jest.fn().mockResolvedValue(null);
        await userController.deleteUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' });
      });


});
