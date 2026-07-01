import { Controller, Post, Get, Patch, Body, UseGuards, Request, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('api')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('auth/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('auth/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        licenseNumber: { type: 'string' },
        vehiclePlate: { type: 'string' },
        vehicleModel: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
    },
  })
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Post('auth/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['currentPassword', 'newPassword'],
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Patch('auth/online-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle driver online/offline status' })
  @ApiBody({ schema: { type: 'object', required: ['isOnline'], properties: { isOnline: { type: 'boolean' } } } })
  toggleOnlineStatus(@Request() req: any, @Body() body: { isOnline: boolean }) {
    return this.authService.toggleOnlineStatus(req.user.id, body.isOnline);
  }

  @Post('auth/forgot-password')
  @ApiOperation({ summary: 'Request a password reset code' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('auth/reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Get('auth/google')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiQuery({ name: 'redirect_uri', required: true })
  googleAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    return this.authService.initiateGoogleAuth(redirectUri, res);
  }

  @Get('auth/google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    return this.authService.handleGoogleCallback(code, state, res);
  }
}
