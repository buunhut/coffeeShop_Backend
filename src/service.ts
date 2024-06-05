import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
config({
  path: './.env',
});

@Injectable()
export class ExtraService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(data: any) {
    const result = this.jwtService.sign(data, {
      expiresIn: '365d',
      secret: process.env.JWT_SECRET_KEY,
    });
    return result;
  }
  async signTokenGas(data: any, time: string) {
    const result = this.jwtService.sign(data, {
      expiresIn: time,
      secret: process.env.JWT_SECRET_KEY,
    });
    return result;
  }
  async getUserIdGas(token: string) {
    const result = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    return result.userId;
  }

  async getUserId(token: string) {
    const result = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    return result.uId;
  }
  async getShopId(token: string) {
    const result = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    return result.shopId;
  }
  async getStaffId(token: string) {
    const result = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    return result.staffId;
  }

  response(statusCode: number, message: string, content: any) {
    return {
      statusCode,
      message,
      content,
    };
  }

  async checkAllow(token: string, prisma: any) {
    const staffId = await this.getStaffId(token);
    //check quyền
    const find = await prisma.staff.findFirst({
      where: {
        staffId,
        staffRole: {
          array_contains: ['admin'],
        },
      },
    });
    return find;
  }
}

//chức năng chặn API
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest(); //bắt được request
      const { token } = request.headers;
      const verify = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      }); //verify token
      if (!verify) {
        throw new UnauthorizedException('token không hợp lệ');
      }
      return true; //return true để next()
    } catch (error) {
      throw new UnauthorizedException('token không hợp lệ');
    }
  }
}
