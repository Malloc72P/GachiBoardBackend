import * as mongoose from 'mongoose';
import { ServerSetting } from '../../Config/server-setting';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(ServerSetting.dbUrl),
  },
];
