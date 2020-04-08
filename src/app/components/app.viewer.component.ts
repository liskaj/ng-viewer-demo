import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';

export class ViewerEventArgs {
    type: string;
}

export interface DocumentLoadedEventArgs {
    document: Autodesk.Viewing.Document;
}

export interface ModelRootLoadedEventArgs extends ViewerEventArgs {
    model: Autodesk.Viewing.Model;
    svf: any;
    target: any;
}

export interface SelectionChangedEventArgs extends ViewerEventArgs {
    dbIdArray: number[];
    fragIdsArray: number[];
    model: Autodesk.Viewing.Model;
    nodeArray: number[];
}

@Component({
    selector: 'viewer',
    templateUrl: './app.viewer.component.html',
    styleUrls: [
        './app.viewer.component.css'
    ]
})
export class ViewerComponent implements OnChanges, OnDestroy, OnInit {
    @Input() urn: string;

    @Output() documentLoaded: EventEmitter<DocumentLoadedEventArgs> = new EventEmitter<DocumentLoadedEventArgs>();
    @Output() modelRootLoaded: EventEmitter<ModelRootLoadedEventArgs> = new EventEmitter<ModelRootLoadedEventArgs>();
    @Output() selectionChanged: EventEmitter<SelectionChangedEventArgs> = new EventEmitter<SelectionChangedEventArgs>();
    @Output() viewerInitialized: EventEmitter<ViewerEventArgs> = new EventEmitter<ViewerEventArgs>();
    @Output() viewerUninitialized: EventEmitter<ViewerEventArgs> = new EventEmitter<ViewerEventArgs>();
    @Output() viewerLoaded: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('viewer', { static: false }) viewerContainer: ElementRef;

    private _viewer: Autodesk.Viewing.GuiViewer3D;

    constructor() {}

    public ngOnInit(): void {
    }

    public async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes['urn'] && changes['urn'].currentValue) {
            await this.load(changes['urn'].currentValue);
        }
    }

    public ngOnDestroy(): void {
        if (this._viewer) {
            this._viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, eventData => {
                this.onSelectionChanged(eventData);
            });
            this._viewer.removeEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, eventData => {
                this.onModelRootLoaded(eventData);
            });
            this._viewer.removeEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, eventData => {
                this.onViewerInitialized(eventData);
            });
            this._viewer.removeEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, eventData => {
                this.onViewerUninitialized(eventData);
            });
            this._viewer.tearDown();
            this._viewer.uninitialize();
        }
        this._viewer = null;
    }

    private async load(urn: string): Promise<void> {
        if (!urn) {
            return;
        }
        const doc = await this.loadDocument(urn);
        const viewable = doc.getRoot().getDefaultGeometry();

        if (!this._viewer) {
            this._viewer = new Autodesk.Viewing.GuiViewer3D(this.viewerContainer.nativeElement);
            this._viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, eventData => {
                this.onModelRootLoaded(eventData);
            });
            this._viewer.addEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, eventData => {
                this.onViewerInitialized(eventData);
            });
            this._viewer.addEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, eventData => {
                this.onViewerUninitialized(eventData);
            });
            this.viewerLoaded.emit({
                viewer: this._viewer,
            });
        }
        if (!this._viewer.started) {
            this._viewer.start();
            this._viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async (eventData) => {
                this.onSelectionChanged(eventData);
            });
        }
        await this._viewer.loadDocumentNode(doc, viewable);
    }

    private loadDocument(urn: string): Promise<Autodesk.Viewing.Document> {
        return new Promise<Autodesk.Viewing.Document>((resolve, reject) => {
            Autodesk.Viewing.Document.load(
                `urn:${urn}`,
                doc => {
                    this.documentLoaded.emit({
                        document: doc,
                    });
                    resolve(doc);
                },
                (errorCode, errorMsg, messages) => {
                    reject(new Error(errorMsg));
                }
            );
        });
    }

    private onModelRootLoaded(eventData: any): void {
        this.modelRootLoaded.emit(eventData);
    }
    
    private onSelectionChanged(eventData: any): void {
        this.selectionChanged.emit(eventData);
    }

    private onViewerInitialized(eventData: any): void {
        this.viewerInitialized.emit(eventData);
    }

    private onViewerUninitialized(eventData: any): void {
        this.viewerUninitialized.emit(eventData);
    }
}
