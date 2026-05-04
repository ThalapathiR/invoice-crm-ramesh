import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import Configuration from "./Config/Configuration";
import { MulterModule } from "@nestjs/platform-express";
import { Redis } from "ioredis";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ClsModule } from "nestjs-cls";
import { CacheService } from "./Service/Cache.service";
import { AutoNumberController } from "./Controller/Admin/AutoNumber.controller";
import { LoginController } from "./Controller/Auth/Login.controller";
import { UserController } from "./Controller/Admin/User.controller";
import { UserRoleController } from "./Controller/Admin/UserRole.controller";
import { EmailConfigController } from "./Controller/Admin/EmailConfig.controller";
import { CountryController } from "./Controller/Admin/Country.controller";
import { CurrencyController } from "./Controller/Admin/Currency.controller";
import { CompanyController } from "./Controller/Admin/Company.controller";
import { AuthService } from "./Service/Auth/Auth.service";
import { UserService } from "./Service/Admin/User.service";
import { UserRoleService } from "./Service/Admin/UserRole.service";
import { EmailService } from "./Service/Email.service";
import { EmailConfigService } from "./Service/Admin/EmailConfig.service";
import { CountryService } from "./Service/Admin/Country.service";
import { CurrencyService } from "./Service/Admin/Currency.service";
import { CompanyService } from "./Service/Admin/Company.service";
import { CommonService } from "./Service/Common.service";
import { JwtStrategy } from "./Service/Auth/JwtStrategy.service";
import { ErrorLogController } from "./Controller/Admin/ErrorLog.controller";
import { AuditLogController } from "./Controller/Admin/AuditLog.controller";
import { ErrorLogService } from "./Service/Admin/ErrorLog.service";
import { AuditLogService } from "./Service/Admin/AuditLog.service";
import { ExceptionHelper } from "./Helper/Exception.helper";
import { MailerService } from "./Service/Mailer.service";
import { EncryptionService } from "./Service/Encryption.service";
import { CommonSeederService } from "./Database/Seeds/CommonSeeder.service";
import { ProductController } from "./Controller/Pos/Product.controller";
import { CustomerController } from "./Controller/Pos/Customer.controller";
import { InvoiceController } from "./Controller/Pos/Invoice.controller";
import { InventoryController } from "./Controller/Pos/Inventory.controller";
import { ReportController } from "./Controller/Pos/Report.controller";
import { PaymentController } from "./Controller/Pos/Payment.controller";
import { ProductService } from "./Service/Pos/Product.service";
import { CustomerService } from "./Service/Pos/Customer.service";
import { InvoiceService } from "./Service/Pos/Invoice.service";
import { InventoryService } from "./Service/Pos/Inventory.service";
import { ReportService } from "./Service/Pos/Report.service";
import { PaymentService } from "./Service/Pos/Payment.service";
import { DashboardController } from "./Controller/Pos/Dashboard.controller";
import { DashboardService } from "./Service/Pos/Dashboard.service";
import { ProductCategoryController } from "./Controller/Pos/ProductCategory.controller";
import { ProductSizeController } from "./Controller/Pos/ProductSize.controller";
import { ProductCategoryService } from "./Service/Pos/ProductCategory.service";
import { ProductSizeService } from "./Service/Pos/ProductSize.service";
import { AnalyticsController } from "./Controller/Pos/Analytics.controller";
import { AnalyticsService } from "./Service/Pos/Analytics.service";
import { BankController } from "./Controller/Pos/Bank.controller";
import { BankService } from "./Service/Pos/Bank.service";
import { ExpenseController } from "./Controller/Pos/Expense.controller";
import { ExpenseService } from "./Service/Pos/Expense.service";
import { CustomerLedgerController } from "./Controller/Pos/CustomerLedger.controller";
import { CustomerLedgerService } from "./Service/Pos/CustomerLedger.service";
import { ExpenseCategoryController } from "./Controller/Pos/ExpenseCategory.controller";
import { TenantUserRoleController } from "./Controller/Pos/TenantUserRole.controller";
import { EmployeeController } from "./Controller/Pos/Employee.controller";
import { SyncController } from "./Controller/Pos/Sync.controller";
import { GoogleSheetsService } from "./Service/GoogleSheets.service";
import { PrinterController } from "./Controller/Pos/Printer.controller";
import { PrinterService } from "./Service/Pos/Printer.service";

@Module({
  imports: [
    ClsModule,
    ServeStaticModule.forRoot({
      rootPath: __dirname + "/client",
      exclude: ["/api/{*path}", "/swagger/{*path}"],
    }),
    EventEmitterModule.forRoot({ maxListeners: 0 }),
    ConfigModule.forRoot({ isGlobal: true, load: [Configuration] }),
    MulterModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (_ConfigService: ConfigService) => ({
        type: "postgres",
        host: _ConfigService.get("Database.Host"),
        port: _ConfigService.get("Database.Port"),
        username: _ConfigService.get("Database.User"),
        password: _ConfigService.get("Database.Password"),
        database: _ConfigService.get("Database.Name"),
        synchronize: _ConfigService.get("Database.Sync"),
        keepConnectionAlive: true,
        entities: [__dirname + "/Database/**/*.{ts,js}"],
        logger: "advanced-console",
        logging: _ConfigService.get("Database.LOG"),
        bigNumberStrings: false,
        supportBigNumbers: true,
        dateStrings: true,
        timezone: "local",
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({
      defaultStrategy: "jwt",
      session: false,
      property: "user",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (_ConfigService: ConfigService) => ({
        secret: _ConfigService.get("JWT.SecretToken"),
        signOptions: { expiresIn: _ConfigService.get("JWT.ExpiresIn") },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    LoginController,
    UserController,
    UserRoleController,
    EmailConfigController,
    CountryController,
    CurrencyController,
    CompanyController,
    ErrorLogController,
    AuditLogController,
    AutoNumberController,
    ProductController,
    CustomerController,
    InvoiceController,
    InventoryController,
    ReportController,
    PaymentController,
    DashboardController,
    ProductCategoryController,
    ProductSizeController,
    AnalyticsController,
    BankController,
    ExpenseController,
    CustomerLedgerController,
    ExpenseCategoryController,
    TenantUserRoleController,
    EmployeeController,
    SyncController,
    PrinterController,
  ],
  providers: [
    AuthService,
    UserService,
    UserRoleService,
    EmailService,
    EmailConfigService,
    CountryService,
    CurrencyService,
    CompanyService,
    CommonService,
    JwtStrategy,
    ErrorLogService,
    AuditLogService,
    ProductService,
    CustomerService,
    InvoiceService,
    InventoryService,
    ReportService,
    PaymentService,
    DashboardService,
    ProductCategoryService,
    ProductSizeService,
    AnalyticsService,
    BankService,
    ExpenseService,
    CustomerLedgerService,
    GoogleSheetsService,
    PrinterService,
    {
      provide: APP_FILTER,
      useClass: ExceptionHelper,
    },
    MailerService,
    EncryptionService,
    CommonSeederService,
    CacheService,
    {
      provide: "REDIS_CLIENT",
      useFactory: () => {
        const isEnabled = process.env.REDIS_ENABLE !== "false";
        if (!isEnabled) {
          return null;
        }
        const redis = new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: Number(process.env.REDIS_PORT) || 6379,
          retryStrategy: (times) => {
            if (times > 3) {
              return null; // Stop retrying after 3 attempts
            }
            return Math.min(times * 100, 3000);
          },
        });

        redis.on("error", (error) => {
          console.warn("Redis Error:", error.message);
        });

        return redis;
      },
    },
    CacheService,
  ],
  exports: [AuthService, EncryptionService],
})
export class AppModule {}
