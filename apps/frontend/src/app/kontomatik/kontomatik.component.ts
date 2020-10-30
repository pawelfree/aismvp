import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { kontomatikLogged } from '../store/app.actions';

declare function embedKontomatik({}): any;

@Component({
  selector: 'kontomatik',
  templateUrl: './kontomatik.component.html',
  styleUrls: ['./kontomatik.component.scss'],
})
export class KontomatikComponent implements OnInit {

  constructor(private store: Store<AppState>) {}

  ngOnInit() {

    embedKontomatik({
      client: 'pdudek-test',  // replace it with your assigned client id
      divId: 'kontomatik',       // must match the div element id
      onSuccess: (target, sessionId, sessionIdSignature, options) => {
        this.store.dispatch(kontomatikLogged({sessionId, sessionIdSignature}));
      } 
    })
  }
}
