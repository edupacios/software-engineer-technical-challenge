/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import {PrismaClient, Task} from '@prisma/client'

const prisma = new PrismaClient()

const init = async () => {
  const server: Server = new Server({
    port: 1984,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
    debug: {
      request: ['error'],
    },
  })

  /* list */
  server.route({
    method: 'GET',
    path: '/tasks',
    handler: async (request: Request, h: ResponseToolkit) => {
      return await prisma.task.findMany()
    },
  })

  /* delete */
  server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    handler: async (request: Request, h: ResponseToolkit) => {
      return await prisma.task.delete({
        where: { id: Number(request.params.id) },
      })
    },
  })

  /* create */
  server.route({
    method: ['POST'],
    path: '/tasks',
    handler: async (request: Request, h: ResponseToolkit) => {
      // TO-DO: Implement the create task endpoint
      throw new Error('Not implemented')
    },
  })

  /* update */
  server.route({
    method: ['PUT', 'PATCH'],
    path: '/tasks/{id}',
    handler: async (request: Request, h: ResponseToolkit) => {
      const payload: Task = request.payload as Task;

      if (!Number(request.params.id)) {
        throw new Error('Id is required');
      }

      return prisma.task.update({
        where: {id: Number(request.params.id)},
        data: { completed: payload.completed }
      });
    }
  });

  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

init()
