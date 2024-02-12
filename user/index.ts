import { FastifyPluginCallback, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UserService } from './service';
import { getProfile, login, registration, search } from './models';
import { RouteHandlerMethod } from 'fastify';
import { params, userPro } from 'utility/interface';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserIdFromToken } from '../utility';


interface CustomRequest<Body = any, Params = any, Query = any> extends FastifyRequest {
    body: Body;
    params: Params;
    query: Query;
    user: {
        _id: string;
    };
    userService: UserService;
    jwt: any;
}



const errorHandler = (error: Error, request: any, reply: FastifyReply) => {
    const message = error.message;
    const statusCode = 500; // Set your desired status code here
    reply.code(statusCode).send(message);
};

const loginHandler = async (request: FastifyRequest, reply: FastifyReply, userService: UserService) => {
    const { username, password } = request.body as userPro;

    const user = await userService.login(username, password);
    if (!user) {
        return reply.code(401).send({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'my-super-secret');
    return { jwt: token };
};

const registerHandler = async (request: FastifyRequest, reply: FastifyReply, userService: UserService) => {
    const { username, email, password } = request.body as userPro;

    const existingUserByUsername = await userService.findByUsername(username);
    if (existingUserByUsername) {
        reply.status(400).send({ error: 'Username already exists' });
        return;
    }

    const existingUserByEmail = await userService.findByEmail(email);
    if (existingUserByEmail) {
        reply.status(400).send({ error: 'Email already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userService.register(username, email, hashedPassword);
    return { userId };
};

const meHandler = async (request: FastifyRequest, reply: FastifyReply, userService: UserService) => {    
    const token = request.headers.authorization?.replace('Bearer ', '')
    try {
        if (!token) {
            reply.code(401).send({ message: 'Invalid or expired token' });
            return
        }
        const userId = getUserIdFromToken(token);

        if (!userId) {
            reply.code(401).send({ message: 'Invalid or expired token' });
            return;
        }

        const userProfile = await userService.getProfile(userId);

        return userProfile;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        reply.code(401).send({ message: 'Invalid or expired token' });
    }
};
const userHandler = async (request: FastifyRequest, reply: FastifyReply, userService: UserService) => {
    const { userId } = request.params  as params;
    return userService.getProfile(userId);
};

const searchHandler = async (request: FastifyRequest, reply: FastifyReply, userService: UserService) => {
    const { searchString } = request.params  as params;
    return userService.search(searchString);
};

const plugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
    const userService: UserService = fastify.userService;
    // Unlogged APIs
    fastify.post('/login', { schema: login }, (request, reply) => loginHandler(request, reply, userService));
    fastify.post('/register', { schema: registration }, (request, reply) => registerHandler(request, reply, userService));

    // Logged APIs
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        });
        fastify.get('/me', (request, reply) =>  meHandler(request, reply, userService));
        fastify.get('/:userId', { schema: getProfile }, (request, reply) => userHandler(request, reply, userService));
        fastify.get('/search', { schema: search }, (request, reply) =>  searchHandler(request, reply, userService));
    });

    fastify.setErrorHandler(errorHandler);

    done();
};

export default plugin;
