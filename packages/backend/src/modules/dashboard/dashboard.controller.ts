import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../core/decorators/current-user/current-user.decorator';
import { Roles } from '../../core/decorators/roles/roles.decorator';
import { RolesGuard } from '../../core/guards/roles/roles.guard';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  getMetrics(@CurrentUser() user: any) {
    return this.dashboardService.getMetrics(user);
  }

  @Get('timeseries')
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  getTimeSeries(
    @Query('period') period: string = '30d',
    @CurrentUser() user: any
  ) {
    return this.dashboardService.getTimeSeries(period, user);
  }

  @Get('conversations')
  @Roles('admin', 'support')
  @UseGuards(RolesGuard)
  getConversations(@CurrentUser() user: any) {
    return this.dashboardService.getConversations(user);
  }
}
