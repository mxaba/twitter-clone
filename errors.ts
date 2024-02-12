import { FastifyReply } from "fastify";

export const errors = {
  USERNAME_IS_NOT_AVAILABLE: 'USERNAME_IS_NOT_AVAILABLE',
  WRONG_CREDENTIAL: 'WRONG_CREDENTIAL'
};


export const errorHandler = (error: Error, request: any, reply: FastifyReply) => {
  const message = error.message;
  const statusCode = 500; // Set your desired status code here
  reply.code(statusCode).send(message);
};