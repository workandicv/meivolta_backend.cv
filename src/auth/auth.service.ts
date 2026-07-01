import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserType } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private resetCodes = new Map<string, { code: string; expires: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        phone: dto.phone,
        userType: dto.userType as UserType,
        licenseNumber: dto.licenseNumber,
        vehiclePlate: dto.vehiclePlate,
        vehicleModel: dto.vehicleModel,
        avatarUrl: dto.avatarUrl,
      },
    });

    const token = this.generateToken(user);
    this.logger.log(`User registered: ${user.email}`);
    return {
      token,
      user: {
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        userType: user.userType, licenseNumber: user.licenseNumber,
        vehiclePlate: user.vehiclePlate, vehicleModel: user.vehicleModel,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);
    this.logger.log(`User logged in: ${user.email}`);
    return {
      token,
      user: {
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        userType: user.userType, licenseNumber: user.licenseNumber,
        vehiclePlate: user.vehiclePlate, vehicleModel: user.vehicleModel,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      user: {
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        userType: user.userType, isActive: user.isActive,
        isOnline: user.isOnline ?? false,
        licenseNumber: user.licenseNumber, vehiclePlate: user.vehiclePlate,
        vehicleModel: user.vehicleModel,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async toggleOnlineStatus(userId: string, isOnline: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.userType !== 'DRIVER' && user.userType !== 'GUIDE') {
      throw new BadRequestException('Only drivers can toggle online status');
    }

    const updateData: any = { isOnline };

    if (isOnline) {
      // Going online: set onlineSince and create a session
      updateData.onlineSince = new Date();
      await this.prisma.driverSession.create({
        data: { driverId: userId },
      });
    } else {
      // Going offline: close the open session
      updateData.onlineSince = null;
      const openSession = await this.prisma.driverSession.findFirst({
        where: { driverId: userId, endedAt: null },
        orderBy: { startedAt: 'desc' },
      });
      if (openSession) {
        await this.prisma.driverSession.update({
          where: { id: openSession.id },
          data: { endedAt: new Date() },
        });
      }
    }

    await this.prisma.user.update({ where: { id: userId }, data: updateData });
    this.logger.log(`Driver ${userId} is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    return { isOnline };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; licenseNumber?: string; vehiclePlate?: string; vehicleModel?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    // Only allow driver-specific fields for drivers
    if (user.userType === 'DRIVER') {
      if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber;
      if (data.vehiclePlate !== undefined) updateData.vehiclePlate = data.vehiclePlate;
      if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data: updateData });
    this.logger.log(`Profile updated: ${updated.email}`);
    return {
      user: {
        id: updated.id, email: updated.email, name: updated.name, phone: updated.phone,
        userType: updated.userType, isActive: updated.isActive,
        licenseNumber: updated.licenseNumber, vehiclePlate: updated.vehiclePlate,
        vehicleModel: updated.vehicleModel,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    this.logger.log(`Password changed for user: ${user.email}`);
    return { message: 'Password changed successfully' };
  }

  // Forgot password - generate a 6-digit code stored in memory
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If the email exists, a reset code has been generated.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetCodes.set(email.toLowerCase(), { code, expires: Date.now() + 15 * 60 * 1000 });
    this.logger.log(`Password reset code generated for: ${email} - Code: ${code}`);
    // In production, this would send an email/SMS. For now, code is in server logs.
    return { message: 'If the email exists, a reset code has been generated.', code };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const entry = this.resetCodes.get(email.toLowerCase());
    if (!entry || entry.code !== code || Date.now() > entry.expires) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { email }, data: { password: hashed } });
    this.resetCodes.delete(email.toLowerCase());
    this.logger.log(`Password reset successfully for: ${email}`);
    return { message: 'Password reset successfully' };
  }

  // Google SSO
  async initiateGoogleAuth(redirectUri: string, res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      this.logger.error('Google SSO not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return res.redirect(`${redirectUri}?error=Google+SSO+not+configured`);
    }

    const appOrigin = (this.configService.get<string>('APP_ORIGIN') ?? '').replace(/\/$/, '');
    const callbackUrl = `${appOrigin}/api/auth/google/callback`;

    // Sign state with HMAC
    const jwtSecret = this.configService.get<string>('JWT_SECRET') ?? '';
    const statePayload = JSON.stringify({ redirect_uri: redirectUri, ts: Date.now() });
    const hmac = crypto.createHmac('sha256', jwtSecret).update(statePayload).digest('hex');
    const state = Buffer.from(JSON.stringify({ payload: statePayload, sig: hmac })).toString('base64url');

    const oauth2Client = new OAuth2Client(clientId, clientSecret, callbackUrl);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });

    this.logger.log(`Redirecting to Google OAuth, callback: ${callbackUrl}`);
    return res.redirect(authUrl);
  }

  async handleGoogleCallback(code: string, state: string, res: Response) {
    let redirectUri = '';
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') ?? '';
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      const { payload, sig } = decoded;
      const expectedSig = crypto.createHmac('sha256', jwtSecret).update(payload).digest('hex');
      if (sig !== expectedSig) throw new Error('Invalid state signature');
      const stateData = JSON.parse(payload);
      redirectUri = stateData.redirect_uri;

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '';
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '';
      const appOrigin = (this.configService.get<string>('APP_ORIGIN') ?? '').replace(/\/$/, '');
      const callbackUrl = `${appOrigin}/api/auth/google/callback`;

      const oauth2Client = new OAuth2Client(clientId, clientSecret, callbackUrl);
      const { tokens } = await oauth2Client.getToken(code);

      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: clientId,
      });
      const googlePayload = ticket.getPayload();
      if (!googlePayload?.email_verified) {
        throw new Error('Email not verified by Google');
      }
      const googleEmail = googlePayload.email!;
      const googleName = googlePayload.name ?? googleEmail.split('@')[0];

      // Find or create user
      let user = await this.prisma.user.findUnique({ where: { email: googleEmail } });
      if (!user) {
        const randomPw = crypto.randomBytes(32).toString('hex');
        user = await this.prisma.user.create({
          data: {
            email: googleEmail,
            password: await bcrypt.hash(randomPw, 10),
            name: googleName,
            userType: 'TOURIST',
          },
        });
        this.logger.log(`New Google SSO user created: ${googleEmail}`);
      } else {
        this.logger.log(`Existing user logged in via Google: ${googleEmail}`);
      }

      const token = this.generateToken(user);
      const userJson = encodeURIComponent(JSON.stringify({
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        userType: user.userType, licenseNumber: user.licenseNumber,
        vehiclePlate: user.vehiclePlate, vehicleModel: user.vehicleModel,
      }));

      return res.redirect(`${redirectUri}?token=${token}&user=${userJson}`);
    } catch (err: any) {
      this.logger.error(`Google OAuth error: ${err?.message}`);
      const errRedirect = redirectUri || '/';
      return res.redirect(`${errRedirect}?error=${encodeURIComponent(err?.message ?? 'Authentication failed')}`);
    }
  }

  private generateToken(user: { id: string; email: string; userType: UserType }) {
    return this.jwtService.sign({ sub: user.id, email: user.email, userType: user.userType });
  }
}
