import { ModelDefinition, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class App {
  name: string;
}

export type AppDocument = HydratedDocument<App>;
export const AppSchema = SchemaFactory.createForClass(App);
export const AppFeature: ModelDefinition = {
  name: App.name,
  schema: AppSchema,
  collection: 'apps',
};
