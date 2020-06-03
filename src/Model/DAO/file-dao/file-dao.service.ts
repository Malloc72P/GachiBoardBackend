import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { IGridFSWriteOption, MongoGridFS } from 'mongo-gridfs';

@Injectable()
export class FileDaoService {
  private fileModel: MongoGridFS;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.fileModel = new MongoGridFS(this.connection.db, 'CloudStorage');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return this.fileModel.readFileStream(id);
  }

  async writeStream(stream, options?: IGridFSWriteOption): Promise<any> {
    return await this.fileModel
      .writeFileStream(stream, options);
  }

  async findInfo(id: Types.ObjectId): Promise<any> {
    return await this.fileModel
      .findById(id.toHexString());
  }

  public async writeFile(
    file,
    metadata,
  ): Promise<any> {
    return await this.fileModel
      .uploadFile(
        file.path,
        {
          filename: file.originalname,
          contentType: file.mimetype,
          metadata,
        },
        true,
      );
  }
}
