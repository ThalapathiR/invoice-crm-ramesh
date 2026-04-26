import { product } from '../src/Database/Table/Pos/product';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [product],
  });

  await ds.initialize();
  const p = await ds.getRepository(product).findOne({ where: { barcode: '598422104085' } });
  console.log('Product:', p);
  await ds.destroy();
}

check().catch(console.error);
