import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authservice:AuthService){}

  @Post('register')
  register(@Body() dto:RegisterDto){
    return this.authservice.register(dto);
  }

  @Post('login')
  login(@Body() dto:LoginDto){
    return this.authservice.login(dto.username,dto.password);
  }

}
