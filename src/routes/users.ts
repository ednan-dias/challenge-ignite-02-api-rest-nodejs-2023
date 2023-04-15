import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/snack',
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const createSnackSchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
        userId: z.string().uuid(),
      })

      const { name, description, isDiet, userId } = createSnackSchema.parse(
        req.body,
      )

      const user = await knex('users').where('id', userId).select().first()

      if (!user) {
        return reply.status(404).send({ message: 'User not exists!' })
      }

      await knex('snacks').insert({
        id: randomUUID(),
        name,
        description,
        is_diet: isDiet,
        user_id: userId,
      })

      return reply.status(201).send()
    },
  )

  app.post('/', async (req, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserSchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
