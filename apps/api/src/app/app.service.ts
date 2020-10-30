import { HttpService, Injectable } from '@nestjs/common';

const apiKey = process.env.API_KEY || '';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}
  
  login(sessionId: string, sessionIdSignature: string, since: string): Promise<any> {
    if (apiKey === '') {
      return new Promise((resolve, reject) => {
        reject({response: { status: '500', data: 'No api key'}})
      })
    }
    else {
      return this.httpService.post("https://test.api.kontomatik.com/v1/command/default-import.xml?" +
        'sessionId=' + sessionId +
        '&sessionIdSignature=' + sessionIdSignature +
        '&since=' + since 
        , null, { headers: {'X-Api-Key': apiKey } }).toPromise();
    }
  }

  getData(sessionId: string, sessionIdSignature: string, command: string): Promise<any> {

    return this.httpService.get("https://test.api.kontomatik.com/v1/command/"+command+".xml?" +
      'sessionId=' + sessionId +
      '&sessionIdSignature=' + sessionIdSignature 
      , { headers: {'X-Api-Key': apiKey } }).toPromise();
  }
}
