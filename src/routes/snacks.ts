import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function snacksRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  // Listar todas as refeições do mesmo usuário
  app.get('/', async (req, reply) => {
    const snacks = await knex('snacks')
      .where('user_id', req.cookies.sessionId)
      .select()

    return reply.send({ snacks })
  })

  // Listar uma refeição específica
  app.get('/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const snackExists = await knex('snacks').where('id', id).select().first()

    if (!snackExists) {
      return reply.status(404).send({ message: 'Snack not found!' })
    }

    const snack = await knex('snacks')
      .where({
        id,
        user_id: req.cookies.sessionId,
      })
      .select()
      .first()

    return reply.send({ snack })
  })

  // Quantidade total de refeições registradas
  app.get('/count', async (req, reply) => {
    const count = await knex('snacks')
      .where('user_id', req.cookies.sessionId)
      .select()
      .count('*', { as: 'count' })
      .first()

    return reply.send(count)
  })

  // Quantidade total de refeições dentro ou fora da dieta
  app.get('/diet', async (req, reply) => {
    const dietHeadersSchema = z.object({
      is_diet: z.enum(['true', 'false']),
    })

    // eslint-disable-next-line camelcase
    const { is_diet } = dietHeadersSchema.parse(req.headers)

    const isDiet = JSON.parse(is_diet)

    const count = await knex('snacks')
      .where({
        user_id: req.cookies.sessionId,
        is_diet: isDiet,
      })
      .select()
      .count('*', { as: 'count' })
      .first()

    return reply.send(count)
  })

  // Melhor sequência por dia de refeições dentro da dieta
  app.get('/best-sequence', async (req, reply) => {
    const { count } = await knex
      .raw(
        `SELECT 
          COUNT(DISTINCT date(created_at)) AS "count"
          FROM
            snacks
          WHERE
            is_diet = true;`,
      )
      .then((data) => {
        return data[0]
      })

    return reply.send({ best_sequence: count })
  })

  // Criar uma refeição
  app.post('/', async (req, reply) => {
    const createSnackSchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const sessionId = req.cookies.sessionId

    const { name, description, isDiet } = createSnackSchema.parse(req.body)

    await knex('snacks').insert({
      id: randomUUID(),
      name,
      description,
      is_diet: isDiet,
      user_id: sessionId,
    })

    return reply.status(201).send()
  })

  // Editar a refeição
  app.put('/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const snackExists = await knex('snacks').where('id', id).select().first()

    if (!snackExists) {
      return reply.status(404).send({ message: 'Snack not found!' })
    }

    const sessionId = req.cookies.sessionId

    const createSnackSchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, isDiet } = createSnackSchema.parse(req.body)

    await knex('snacks')
      .where({
        id,
        user_id: sessionId,
      })
      .update({
        name,
        description,
        is_diet: isDiet,
        updated_at: Date.now(),
      })

    return reply.status(204).send()
  })

  // Deletar a refeição
  app.delete('/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const snackExists = await knex('snacks').where('id', id).select().first()

    if (!snackExists) {
      return reply.status(404).send({ message: 'Snack not found!' })
    }

    const sessionId = req.cookies.sessionId

    await knex('snacks')
      .where({
        id,
        user_id: sessionId,
      })
      .delete()

    return reply.status(204).send()
  })
}
