import fastify from "fastify";

const server = fastify();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.get("/", async (request, reply) => {
  reply.send({ hello: "world" });
});

server.listen({ port, host: "::" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
