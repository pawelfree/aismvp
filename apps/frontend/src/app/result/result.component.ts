import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.reducer';
import * as selectors from '../store/app.selector';

@Component({
  selector: 'result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {

  sessionId$: Observable<string>
  sessionIdSignature$: Observable<string>
  loading$: Observable<boolean>
  progress$: Observable<string>
  data$: Observable<string>

  constructor(private store: Store<AppState>) {}
  
  ngOnInit() {
    this.sessionId$ = this.store.select(selectors.selectSessionId)
    this.sessionIdSignature$ = this.store.select(selectors.selectSessionIdSignature);
    this.loading$ = this.store.select(selectors.selectLoading);
    this.progress$ = this.store.select(selectors.selectProgress);
    this.data$ = this.store.select(selectors.selectResponse);
  }
}