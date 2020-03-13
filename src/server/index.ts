import { Server, IncomingMessage, ServerResponse } from 'http'
import fastifyStatic from 'fastify-static'
import fastify from 'fastify'
import path from 'path'

import 'dotenv/config'

const server = async (): Promise<fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>> => {
  if (process.env.NODE_ENV === 'development') await import('../webpack')
  const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({})
  server.register((instance, _, next) => {
    instance.register(fastifyStatic, {
      root: path.join(__dirname, 'build'),
      prefix: '/app'
    })
    instance.get('/*', async (_, reply) => reply.sendFile('index.html'))
    next()
  })
  return server
}

server()
  .then(async s => {
    await s.listen(process.env.PORT)
    return console.log(`Server running on port: ${process.env.PORT}`)
  })
  .catch(error => {
    console.error('Server failed to start', error)
    process.exit(1)
  })
