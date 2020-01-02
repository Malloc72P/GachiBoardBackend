import * as mongoose from 'mongoose';
import { HttpHelper } from '../Helper/http-helper';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(HttpHelper.dbUrl),
  },
];
