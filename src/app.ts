import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import cookie from '@fastify/cookie'
import { snacksRoutes } from './routes/snacks'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: '/users',
})

app.register(snacksRoutes, {
  prefix: 'snacks',
})
