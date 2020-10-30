import { createAction, props } from '@ngrx/store';

export const kontomatikLogged = createAction('[Kontomatik] User logged in', props<{sessionId: string, sessionIdSignature: string}>());
export const kontomaticLoadingData = createAction('[Kontomatik] Logged in - redirect to data page');
export const kontomatikStartFetching = createAction('[Kontomatik] Kontomatik start waiting for a data');
export const kontomatikProcessCommand = createAction('[Kontomatik] Process command info', props<{command: string, progress: string}>());
export const kontomatikDataReceived = createAction('[Kontomatik] Data received', props<{data:string}>());
export const error = createAction('[App] Error');