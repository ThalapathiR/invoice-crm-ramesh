import { DataSource } from 'typeorm';
import { user_role } from '../Table/Admin/user_role';
import { user } from '../Table/Admin/user';
import { currency } from '../Table/Admin/currency';
import { country } from '../Table/Admin/country';
import { company } from '../Table/Admin/company';
import { product_category } from '../Table/Pos/product_category';
import { product_size } from '../Table/Pos/product_size';
import { Injectable } from '@nestjs/common';
import { EncryptionService } from '@Service/Encryption.service';

@Injectable()
export class CommonSeederService {
  constructor(
    private readonly _EncryptionService: EncryptionService,
    private _DataSource: DataSource
  ) {
  }
  async Run() {
    console.log('--- Starting Database Seeding ---');
    try {
      await this.UserRoleSeed();
      console.log('✅ User Role seeding completed');
    }
    catch (e) {
      console.error('❌ User Role seeding failed:', e.message);
    }

    try {
      await this.UserSeed();
      console.log('✅ User seeding completed');
    }
    catch (e) {
      console.error('❌ User seeding failed:', e.message);
    }

    try {
      await this.CurrencySeed();
      console.log('✅ Currency seeding completed');
    }
    catch (e) {
      console.error('❌ Currency seeding failed:', e.message);
    }

    try {
      await this.CountrySeed();
      console.log('✅ Country seeding completed');
    }
    catch (e) {
      console.error('❌ Country seeding failed:', e.message);
    }

    try {
      await this.CompanySeed();
      console.log('✅ Company seeding completed');
    }
    catch (e) {
      console.error('❌ Company seeding failed:', e.message);
    }

    try {
      await this.ProductCategorySeed();
      console.log('✅ Product Category seeding completed');
    }
    catch (e) {
      console.error('❌ Product Category seeding failed:', e.message);
    }

    try {
      await this.ProductSizeSeed();
      console.log('✅ Product Size seeding completed');
    }
    catch (e) {
      console.error('❌ Product Size seeding failed:', e.message);
    }
    console.log('--- Database Seeding Finished ---');
  }


  UserRoleSeed = async () => {
    const roles = [
      { name: 'super_admin', code: 'SUPER_ADMIN', is_team_role: false, created_by_id: "0", created_on: new Date() },
      { name: 'tenant', code: 'TENANT', is_team_role: true, created_by_id: "0", created_on: new Date() },
      { name: 'user', code: 'USER', is_team_role: true, created_by_id: "0", created_on: new Date() }
    ];

    for (const roleData of roles) {
      const exists = await user_role.findOne({ where: { name: roleData.name } });
      if (!exists) {
        await this._DataSource.manager.createQueryBuilder()
          .insert()
          .into(user_role)
          .values([roleData])
          .execute();
      }
    }
  }

  UserSeed = async () => {
    const UserRoleData = await user_role.findOne({ where: { name: "super_admin" } });
    if (!UserRoleData) {
      throw new Error('Required role "super_admin" not found for user seeding');
    }

    const exists = await user.findOne({ where: { email: 'admin@user.com' } });
    if (!exists) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(user)
        .values([
          {
            user_role_id: UserRoleData.id,
            email: 'admin@user.com',
            password: this._EncryptionService.Encrypt('Login123!!'),
            created_by_id: "0",
            created_on: new Date()
          }
        ])
        .execute();
    }
  }

  CurrencySeed = async () => {
    const exists = await currency.findOne({ where: { name: 'Pound sterling' } });
    if (!exists) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(currency)
        .values([
          {
            name: 'Pound sterling',
            code: 'GBP',
            symbol: '£',
            created_by_id: "0",
            created_on: new Date()
          }
        ])
        .execute();
    }
  }

  CountrySeed = async () => {
    const CurrencyData = await currency.findOne({ where: { name: "Pound sterling" } });
    if (!CurrencyData) {
      throw new Error('Required currency "Pound sterling" not found for country seeding');
    }

    const exists = await country.findOne({ where: { name: 'United Kingdom' } });
    if (!exists) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(country)
        .values([
          {
            name: 'United Kingdom',
            code: 'UK',
            currency_id: CurrencyData.id,
            created_by_id: "0",
            created_on: new Date()
          }
        ])
        .execute();
    }
  }

  CompanySeed = async () => {
    const CurrencyData = await currency.findOne({ where: { name: "Pound sterling" } });
    const CountryData = await country.findOne({ where: { name: "United Kingdom" } });
    
    if (!CurrencyData || !CountryData) {
      throw new Error('Required currency or country not found for company seeding');
    }

    const exists = await company.findOne({ where: { name: "BoilerPlate" } });
    if (!exists) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(company)
        .values([
          {
            name: "BoilerPlate",
            address: "BoilerPlate",
            postal_code: "BoilerPlate",
            country_id: CountryData.id,
            currency_id: CurrencyData.id,
            email: "Demo",
            website: "Demo",
            invoice_footer: "BoilerPlate",
            created_by_id: "0",
            created_on: new Date()
          }
        ])
        .execute();
    }
  }

  ProductCategorySeed = async () => {
    const CompanyData = await company.findOne({ where: { name: "BoilerPlate" } });
    if (!CompanyData) {
      throw new Error('Required company "BoilerPlate" not found for product category seeding');
    }

    const categories = ['Mens', 'Womens', 'Kids', 'Inners'];
    for (const catName of categories) {
      const exists = await product_category.findOne({ where: { name: catName, store_id: CompanyData.id } });
      if (!exists) {
        await product_category.save({
          name: catName,
          store_id: CompanyData.id,
          created_by_id: "0",
          created_on: new Date()
        } as any);
      }
    }
  }

  ProductSizeSeed = async () => {
    const CompanyData = await company.findOne({ where: { name: "BoilerPlate" } });
    if (!CompanyData) {
      throw new Error('Required company "BoilerPlate" not found for product size seeding');
    }

    const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    for (const sizeName of sizes) {
      const exists = await product_size.findOne({ where: { name: sizeName, store_id: CompanyData.id } });
      if (!exists) {
        await product_size.save({
          name: sizeName,
          store_id: CompanyData.id,
          created_by_id: "0",
          created_on: new Date()
        } as any);
      }
    }
  }

}

