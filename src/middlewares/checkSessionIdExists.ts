import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = req.cookies.sessionId

  const user = await knex('users')
    .where('session_id', sessionId)
    .select()
    .first()

  if (!user) {
    return reply.status(404).send({ message: 'User not found!' })
  }

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
