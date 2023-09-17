import { DataSource } from 'typeorm';

import 'dotenv/config';

let host: string | undefined = process.env.POSTGRES_HOST;
let port: number | undefined = Number(process.env.POSTGRES_PORT);
let database: string | undefined = process.env.POSTGRES_DB;

if (process.env.NODE_ENV === 'test') {
  host = process.env.POSTGRES_HOST_TEST;
  port = Number(process.env.POSTGRES_PORT_TEST);
  database = process.env.POSTGRES_DB_TEST;
} else if (process.env.NODE_ENV === 'migrations') {
  host = process.env.POSTGRES_HOST_MIGRATIONS;
}

export const AppDataSource = new DataSource({
  host,
  port,
  database,
  type: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: false,
  entities: ['src/modules/**/infra/typeorm/entities/*.ts'],
  migrations: ['src/shared/infra/database/migrations/*.ts'],
});
