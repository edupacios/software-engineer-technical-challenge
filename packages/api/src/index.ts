/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import { PrismaClient, Task } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const TaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

const NewTaskSchema = TaskSchema.extend({
  id: TaskSchema.shape.id.optional(),
  completed: TaskSchema.shape.completed.optional(),
})

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
      return prisma.task.findMany()
    },
  })

  /* delete */
  server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    handler: async (request: Request, h: ResponseToolkit) => {
      return prisma.task.delete({
        where: { id: Number(request.params.id) }
      })
    },
  })

  /* create */
  server.route({
    method: ['POST'],
    path: '/tasks',
    handler: async (request: Request, h: ResponseToolkit) => {
      const task = NewTaskSchema.parse(request.payload)
      return prisma.task.create({
        data: task as Task,
      })
    },
  })

  /* update */
  server.route({
    method: ['PUT', 'PATCH'],
    path: '/tasks/{id}',
    handler: async (request: Request, h: ResponseToolkit) => {
      const task: Task = <Task>TaskSchema.parse(request.payload)
      return prisma.task.update({
        where: { id: Number(request.params.id) },
        data: { completed: task.completed },
      })
    },
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

init()
