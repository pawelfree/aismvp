import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import { take, map, tap } from 'rxjs/operators';
import * as selectors from './store/app.selector';

@Injectable({ providedIn: 'root'})
export class DataGuard implements CanActivate {

    constructor(
        private readonly store: Store<AppState>,
        private readonly router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.store.select(selectors.selectState).pipe(
            take(1),
            map(data => {
                if (Boolean(data.sessionId) && Boolean(data.sessionIdSignature)) {
                    return true;
                } 
                else {
                    return this.router.parseUrl('/info');
                }
            })
        )
    }
}