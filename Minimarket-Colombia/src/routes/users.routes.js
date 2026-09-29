import { Router } from 'express';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getMyProfile,
    updateMyProfile
} from '../controllers/usersControllers.js';
import verifyToken from '../middlewares/authMiddleware.js';
import soloAdmin from '../middlewares/adminMiddleware.js';

const usersRouter = Router();

usersRouter.get('/me', verifyToken, getMyProfile);
usersRouter.put('/me', verifyToken, updateMyProfile);

usersRouter.get('/', verifyToken, soloAdmin, getUsers);
usersRouter.get('/:id', verifyToken, soloAdmin, getUserById);
usersRouter.post('/', verifyToken, soloAdmin, createUser);
usersRouter.put('/:id', verifyToken, soloAdmin, updateUser);
usersRouter.delete('/:id', verifyToken, soloAdmin, deleteUser);

export default usersRouter;
