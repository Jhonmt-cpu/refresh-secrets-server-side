import { hash } from 'bcryptjs';
import { AppDataSource } from './AppDataSource';

AppDataSource.initialize().then(async () => {
  console.log('Database initialized');

  const password = '3ae54asd51a35sd';

  const passwordHash = await hash(password, 8);

  await AppDataSource.query(
    `INSERT INTO users (name, email, password, is_admin) VALUES ('admin', 'admin@admin.com', '${passwordHash}', true)`,
  );

  await AppDataSource.destroy();
});
