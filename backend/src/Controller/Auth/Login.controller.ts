import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ForgotPasswordModel, ResetPasswordModel } from '@Model/Admin/User.model';
import { UserLoginModel } from '@Model/Admin/UserLogin.model';
import { UserService } from '@Service/Admin/User.service';
import { AuthService } from '@Service/Auth/Auth.service';
import { AuthBaseController } from '@Controller/AuthBase.controller';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { CurrentPayload } from '@Helper/Common.helper';

import { RegisterModel } from '@Model/Admin/User.model';

@Controller({ path: "auth", version: '1' })
@ApiTags("Auth")
export class LoginController extends AuthBaseController {
  constructor(
    private _AuthService: AuthService,
    private _UserService: UserService
  ) {
    super();
  }

  @Post('Login')
  async UserLogin(@Body() UserLogin: UserLoginModel) {
    const result = await this._AuthService.ValidateUser(UserLogin.email, UserLogin.password);
    return { Type: ResponseEnum.Success, Message: 'Login Successfully', result };
  }

  @Post('ForgotPassword')
  async ForgotPassword(@Body() ForgotPasswordData: ForgotPasswordModel) {
    const Result = await this._UserService.ForgotPassword(ForgotPasswordData.email);
    if (Result.status) {
      return this.SendResponse(ResponseEnum.Success, "Forgot password request accepted, please check mail");
    }
    else {
      return this.SendResponse(ResponseEnum.Error, Result.message);
    }
  }

  @Post('ResetPassword')
  async ResetPassword(@Body() ResetPasswordData: ResetPasswordModel) {
    await this._UserService.ResetPassword(ResetPasswordData);
    return this.SendResponse(ResponseEnum.Success, "Password reseted successfully");
  }

  @Post('register')
  async Register(@Body() data: RegisterModel) {
    const result = await this._AuthService.Register(data);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async GetMe(@CurrentPayload() user: any) {
    return user;
  }

}
