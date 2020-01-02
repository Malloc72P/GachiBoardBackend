import { Connection } from 'mongoose';
import { UsersSchema } from './user.schema';

export const usersProviders = [
  {
    provide: 'USERS_MODEL',
    useFactory: (connection: Connection) => connection.model('Users', UsersSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
