import { createEffect, Actions, ofType } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, catchError, map, tap, withLatestFrom, delay } from 'rxjs/operators'; 
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as AppActions  from './app.actions';
import { Store } from '@ngrx/store';
import { AppState } from './app.reducer';
import * as selectors from '../store/app.selector';
import { NgxXmlToJsonService } from 'ngx-xml-to-json';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/api/'

@Injectable()
export class AppEffects {

  kontomatikLoggedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.kontomatikLogged),
    map(_ => AppActions.kontomaticLoadingData()))
  );

  kontomatikLoadingData$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.kontomaticLoadingData),
    tap(_ => this.router.navigate(['/result'])),
    map(_ => AppActions.kontomatikStartFetching())
  ));

  kontomatikStartFetching$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.kontomatikStartFetching),
    withLatestFrom(this.store$.select(selectors.selectSessionId), this.store$.select(selectors.selectSessionIdSignature)),
    switchMap(([action, sessionId, sessionIdSignature]) => {
      const options = {
        params: new HttpParams()
            .set('sessionId', sessionId)
            .set('sessionIdSignature', sessionIdSignature)
            .set('since', '2020-10-01')
      };
      return this.http.get<{status: string, data: string}>(BACKEND_URL + 'login', options)
        .pipe(
            map(res => {
                if (res.status !== '500') {
                    const obj = this.ngxXmlToJsonService.xmlToJson(res.data, { // set up the default options 
                        textKey: 'text', // tag name for text nodes
                        attrKey: 'attr', // tag for attr groups
                        cdataKey: 'cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                        })
                    const command: string = obj.reply.command.attr.id
                    return AppActions.kontomatikProcessCommand({command, progress: '0'}) 
                } else {
                    return AppActions.error();
                }
            }),
            catchError(err => {
                return of({ type: 'DUMMY' });
            })
        )
    })
  ));

  error$ = createEffect(() => this.actions$.pipe(
      ofType(AppActions.error),
      tap(_ => this.router.navigate(['/']))
  ), {dispatch: false})

  kontomatikProcessCommand$ = createEffect(() => this.actions$.pipe(
      ofType(AppActions.kontomatikProcessCommand),
      delay(10000),
      withLatestFrom(this.store$.select(selectors.selectSessionId), this.store$.select(selectors.selectSessionIdSignature)),
      switchMap(([action, sessionId, sessionIdSignature]) => {
        const options = {
            params: new HttpParams()
                .set('sessionId', sessionId)
                .set('sessionIdSignature', sessionIdSignature)
                .set('command', action.command)
            };
            return this.http.get<{ status: string, data: string}>(BACKEND_URL + 'status', options ).pipe(
                map(res => {
                    const obj = this.ngxXmlToJsonService.xmlToJson(res.data, { // set up the default options 
                    textKey: 'text', // tag name for text nodes
                    attrKey: 'attr', // tag for attr groups
                    cdataKey: 'cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                    })
                    const status: string = obj.reply.command.attr.state;
                    if (status === 'successful') {
                        // console.log('received ', obj.reply.command.result);
                        return AppActions.kontomatikDataReceived({data: res.data})
                    } else {
                        return AppActions.kontomatikProcessCommand({command: action.command, progress: obj.reply.command.progress.value.text}) 
                    }
                }),
                catchError(_ => {
                    return of({ type: 'DUMMY' });
                })
             )
      })
  ));

  constructor(
    private readonly store$: Store<AppState>,
    private readonly actions$: Actions,
    private readonly http: HttpClient,
    private readonly router: Router,
    private ngxXmlToJsonService: NgxXmlToJsonService ) {}
}