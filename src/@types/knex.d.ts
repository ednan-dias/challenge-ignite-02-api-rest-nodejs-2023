// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      session_id: string
    }
    snacks: {
      id: string
      name: string
      description: string
      is_diet: boolean
      created_at: string
      user_id: string
    }
  }
}
