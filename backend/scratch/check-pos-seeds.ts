
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { product_category } from '../src/Database/Table/Pos/product_category';
import { product_size } from '../src/Database/Table/Pos/product_size';

async function checkDb() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const categoryCount = await product_category.count();
  const sizeCount = await product_size.count();
  
  console.log(`Product Category count: ${categoryCount}`);
  console.log(`Product Size count: ${sizeCount}`);
  
  const categories = await product_category.find();
  console.log('Categories:', categories.map(c => c.name));
  
  const sizes = await product_size.find();
  console.log('Sizes:', sizes.map(s => s.name));
  
  await app.close();
}

checkDb();
