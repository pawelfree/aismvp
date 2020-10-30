import {createFeatureSelector, createSelector} from '@ngrx/store';
import { AppState } from './app.reducer';


export const selectState = createFeatureSelector<AppState>('state');

export const selectSessionId = createSelector(
  selectState,
  state => state.sessionId
);

export const selectSessionIdSignature = createSelector(
  selectState,
  state => state.sessionIdSignature
);

export const selectLoading = createSelector(
  selectState,
  state => state.loading
);

export const selectCommand = createSelector(
  selectState,
  state => state.command
);

export const selectProgress = createSelector(
  selectState,
  state => state.progress
);

export const selectResponse = createSelector(
  selectState,
  state => state.data
);

