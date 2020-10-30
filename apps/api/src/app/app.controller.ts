import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('login')
  login(@Query('sessionId') sessionId,
          @Query('sessionIdSignature') sessionIdSignature,
          @Query('since') since) {

    return this.appService.login(sessionId, sessionIdSignature, since)
    .then(res => {
      return { status: res.status, data: res.data}
    })
    .catch(err => {
      return { status: err.response.status, data: err.response.data }
    })
  }

  @Get('status')
  getData(@Query('sessionId') sessionId,
  @Query('sessionIdSignature') sessionIdSignature,
  @Query('command') command) {
    return this.appService.getData(sessionId, sessionIdSignature, command)
    .then(res => {
      return { status: res.status, data: res.data}
    })
    .catch(err => {
      return { status: err.response.status, data: err.response.data }
    })
  }
}
