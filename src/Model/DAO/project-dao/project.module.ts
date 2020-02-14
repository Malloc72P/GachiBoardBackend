import { Module } from '@nestjs/common';
import { ProjectController } from '../../../Controller/project/project.controller';
import { DatabaseModule } from '../../Database/database.module';
import { ProjectDaoService } from './project-dao.service';
import { projectProviders } from './project.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [
    ProjectDaoService,
    ...projectProviders,
  ],
})
export class CatsModule {}
