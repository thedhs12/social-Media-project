import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt  from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private usersService: Repository<User>,
    private jwtService:JwtService){}


    async register(createUserDto: RegisterDto) {
      const { username, password, bio } = createUserDto;
    
      const userExists = await this.usersService.findOne({ where: { username } });
      if (userExists) {
        throw new UnauthorizedException('Username already exists');
      }
    
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.usersService.create({ username, password: hashedPassword, bio });
      return this.usersService.save(user);
    }


     async login(username:string,password:string){
      let user=await this.usersService.findOne({where:{username}});
      if(!user || !(await bcrypt.compare(password,user.password))){
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload={sub:user.id,username:user.username};
      return {access_token:this.jwtService.sign(payload)};
     }

}
