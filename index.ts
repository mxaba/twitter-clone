import fastify, { FastifyInstance } from "fastify";

const app: FastifyInstance = fastify({logger: true});

app.get('/', (request, reply) => {
    reply.send({hello: "world"})
})


app.listen(3000, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`Server listening on ${address}`)
})

