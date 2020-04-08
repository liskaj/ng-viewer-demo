import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [
        AuthService
    ]
})
export class AppComponent implements OnInit {
    public initialized: boolean = false;
    public title: string = 'ng-viewer-demo';

    urn: string;

    constructor(private authSvc: AuthService) {
    }

    public ngOnInit(): void {
        this.authSvc.initialize().subscribe(() => {
            this.initialized = true;
        });
    }

    public load(): void {
        console.debug(`AppComponent#load`);
        this.urn = 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLkhMaGFGa3VuVDVXWXVnVXhwTDkzd1E_dmVyc2lvbj0x';
    }

    public onSelectionChanged(): void {
        console.debug(`AppComponent#onSelectionChanged`);
    }
}
