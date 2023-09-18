import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { AuthUser } from 'prisma/schema';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async validateUser(emailOrPhonenumber: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhonenumber },
          { phoneNumber: emailOrPhonenumber },
          {
            vendor: { email: emailOrPhonenumber },
          },
          {
            vendor: { phoneNumber: emailOrPhonenumber },
          },
        ],
      },
      include: {
        password: true,
        vendor: true,
      },
    });

    if (!user) return null;

    const userEmail =
      user.role === UserRole.VENDOR ? user.vendor.email : user.email;

    const userPhoneNumber =
      user.role === UserRole.VENDOR
        ? user.vendor.phoneNumber
        : user.phoneNumber;

    if (
      emailOrPhonenumber !== userEmail &&
      emailOrPhonenumber !== userPhoneNumber
    ) {
      return null;
    }

    if (user && (await argon2.verify(user.password.passwordHash, pass))) {
      return user;
    }
    return null;
  }

  async login(user: AuthUser) {
    delete user.password;
    const payload = {
      email: user.email,
      role: user.role,
      sub: user.id,
    };

    if (user.vendor && !user.vendor.approved) {
      throw new UnauthorizedException('Account not approved');
    }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getAuthUser(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: true,
      },
    });
  }
}
