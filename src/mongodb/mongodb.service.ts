import { TestArtifact } from 'src/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class MongodbService implements TestArtifact {
  private mongodb: MongoMemoryServer;
  private _uri: string;

  constructor(private readonly dbName: string) {}

  get uri(): string {
    return this._uri;
  }

  async startup(): Promise<boolean> {
    this.mongodb = await MongoMemoryServer.create({
      instance: { dbName: this.dbName },
    });
    this._uri = this.mongodb.getUri(this.dbName);
    return true;
  }
  async shutdown(): Promise<boolean> {
    await this.mongodb.stop({
      doCleanup: true,
      force: true,
    });
    return true;
  }
}
