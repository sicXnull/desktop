import { Injectable } from "@angular/core";
import * as _ from 'lodash';
import { RpcStateService } from "../rpc/rpc.module";
import { BehaviorSubject } from "rxjs";
import { POSQService } from "./posq.service";
import { Log } from "ng2-logger";

@Injectable()
export class AppSettingsService {
    private _net: string = null;
    public onNetChangeObs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private log: any = Log.create('app-settings.service');

    constructor(
        private rpcState: RpcStateService, 
        private posqService: POSQService
        ) {
        this.rpcState.observe('settings')
            .subscribe(net => this.setNet(net));
    }

    private setNet(net: string): void {
        this._net = net;
        this.onNetChangeObs.next(net);
    }

    public get net(): string {
        return this._net;
    }

    public init(): void {
        this.posqService.call('settings', ['get', 'net'])
            .take(1)
            .subscribe(net => this.rpcState.set('settings', net), err => this.log.er('init:', err));
    }
}
