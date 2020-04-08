import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
    private _initialized: boolean = false;

    constructor(private http: HttpClient) {
    }

    public initialize(): Observable<void> {
        return new Observable<void>((observer) => {
            if (this._initialized) {
                observer.next();
                observer.complete();
            } else {
                const options = {
                    getAccessToken: this.createToken.bind(this)
                };

                Autodesk.Viewing.Initializer(options, () => {
                    this._initialized = true;
                    observer.next();
                    observer.complete();
                });
            }
        });
    }

    private createToken(callback: (token: string, expires?: number) => void): void {
        const url: string = `/api/services/auth/v1/viewtoken`;

        this.http.post(url, null).subscribe((token: any) => {
            callback(token.access_token, token.expires_in);
        });
    }
}
