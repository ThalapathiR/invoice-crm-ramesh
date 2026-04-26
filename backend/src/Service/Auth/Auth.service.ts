import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { company } from '@Database/Table/Admin/company';
import { user } from '@Database/Table/Admin/user';
import { user_role } from '@Database/Table/Admin/user_role';
import { currency } from '@Database/Table/Admin/currency';
import { country } from '@Database/Table/Admin/country';
import { product_category } from '@Database/Table/Pos/product_category';
import { product_size } from '@Database/Table/Pos/product_size';
import { EncryptionService } from '../Encryption.service';
import { RegisterModel } from '@Model/Admin/User.model';

@Injectable()
export class AuthService {
  constructor(private _JwtService: JwtService, private _EncryptionService: EncryptionService) { }

  async ValidateUser(usernameOrEmail: string, password: string): Promise<any> {
    const UserData = await user.findOne({ 
      where: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ], 
      relations: ['user_role', 'store'] 
    });

    if (!UserData) {
      throw new Error('Invalid email id');
    }

    if (UserData.status == false) {
      throw new Error('User suspended, contact administration');
    }

    if (this._EncryptionService.Decrypt(UserData.password) != password) {
      throw new Error('Invalid password');
    }

    // Fetch company from store relation or fallback to system default if store is missing (for super admins)
    let companyData = UserData.store;
    if (!companyData) {
        const allCompanies = await company.find({ relations: ["currency"] });
        companyData = allCompanies[0];
    }

    const payload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_name: UserData.user_role.name,
      company: companyData
    };
    const api_token = this._JwtService.sign(payload);
    return { api_token, user: payload };
  }

  async Register(data: RegisterModel): Promise<any> {
    const existingUser = await user.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // 1. Create a default company for the new user
    const CompanyData = new company();
    CompanyData.name = data.company;
    CompanyData.email = data.email;
    CompanyData.address = "Store Address";
    CompanyData.postal_code = "000000";
    CompanyData.created_by_id = "0";
    CompanyData.created_on = new Date();
    
    const CurrencyData = await currency.findOne({ where: {} });
    const CountryData = await country.findOne({ where: {} });
    
    if (!CurrencyData || !CountryData) {
      throw new Error('System initialization incomplete: Default Currency or Country not found in database. Please ensure seeding is enabled and successful.');
    }
    
    CompanyData.currency_id = CurrencyData.id;
    CompanyData.country_id = CountryData.id;
    
    await company.save(CompanyData);

    // 1.1 Seed default categories for the new company
    const categories = ['Mens', 'Womens', 'Kids', 'Inners'];
    for (const catName of categories) {
      const cat = new product_category();
      cat.name = catName;
      cat.store_id = CompanyData.id;
      cat.created_by_id = "0";
      cat.created_on = new Date();
      await product_category.save(cat);
    }

    // 1.2 Seed default sizes for the new company
    const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    for (const sizeName of sizes) {
      const size = new product_size();
      size.name = sizeName;
      size.store_id = CompanyData.id;
      size.created_by_id = "0";
      size.created_on = new Date();
      await product_size.save(size);
    }

    // 2. Assign Role (Default to 'tenant' for new signups)
    let role = await user_role.findOne({ where: { name: 'tenant' } });
    
    // Fallback to super_admin if tenant role is not found (for legacy/system initialization)
    if (!role) {
        role = await user_role.findOne({ where: { name: 'super_admin' } });
    }

    if (!role) {
        throw new Error('System roles not initialized. Please ensure database seeding is complete.');
    }

    // 3. Create User
    const UserData = new user();
    UserData.first_name = data.firstName;
    UserData.last_name = data.lastName;
    UserData.email = data.email;
    UserData.username = data.email;
    UserData.password = this._EncryptionService.Encrypt(data.password);
    UserData.mobile = data.mobile;
    UserData.user_role_id = role.id;
    UserData.store_id = CompanyData.id; // Link to company
    UserData.created_by_id = "0";
    UserData.created_on = new Date();
    
    await user.save(UserData);
    
    return this.ValidateUser(data.email, data.password);
  }
}
