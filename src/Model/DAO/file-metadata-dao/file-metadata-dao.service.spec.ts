import { Test, TestingModule } from '@nestjs/testing';
import { FileMetadataDaoService } from './file-metadata-dao.service';

describe('FileMetadataDaoService', () => {
  let service: FileMetadataDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileMetadataDaoService],
    }).compile();

    service = module.get<FileMetadataDaoService>(FileMetadataDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
