import { createReducer, on } from '@ngrx/store';
 import * as AppActions from './app.actions';

export interface AppState {
    sessionId: string,
    sessionIdSignature: string
    loading: boolean
    command: string
    progress: string
    data: string
}

const initialAppState: AppState = {
    sessionId: null,
    sessionIdSignature: null,
    loading: false,
    command: null,
    progress: null,
    data: null
}

const _appStateReducer = createReducer(initialAppState,
  on(AppActions.kontomatikLogged,(state, {sessionId, sessionIdSignature}) => ({...state, sessionId, sessionIdSignature})),
  on(AppActions.kontomaticLoadingData,(state) => ({...state, loading: true})),
  on(AppActions.kontomatikStartFetching,(state) => (state)),
  on(AppActions.kontomatikProcessCommand,(state, {command, progress} ) => ({...state, command, progress })),
  on(AppActions.kontomatikDataReceived, (state, {data}) => ({...state, loading: false, data})),
  on(AppActions.error,(state) => ({...state, data: null, progress: null, command: null, loading: false, sessionIdSignature: null, sessionId: null}))
);

export function appReducer(state, action) {
  return _appStateReducer(state, action);
}
