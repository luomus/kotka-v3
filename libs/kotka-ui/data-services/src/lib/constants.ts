import { HttpContextToken } from '@angular/common/http';

export const apiBase = '/api';
export const lajiApiBase = '/api/laji';

export const LOGIN_REDIRECT_ENABLED = new HttpContextToken<boolean>(() => true);
