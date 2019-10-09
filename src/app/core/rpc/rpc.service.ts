import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import { map, mergeMap, catchError } from 'rxjs/operators';
import {fromPromise} from 'rxjs/observable/fromPromise';

import { IpcService } from '../ipc/ipc.service';
import {POSQService} from '../../core/services/posq.service';

const MAINNET_PORT = 5511;
const TESTNET_PORT = 15511;
const HOSTNAME = 'localhost';

declare global {
  interface Window {
    electron: boolean;
  }
}

/**
 * The RPC service that maintains a single connection to the posqd daemon.
 *
 * It has two important functions: call and register.
 */

@Injectable()
export class RpcService implements OnDestroy {

  private log: any = Log.create('rpc.service');
  private destroyed: boolean = false;

  /**
   * IP/URL for daemon (default = localhost)
   */
  private hostname: String = HOSTNAME; // TODO: URL Flag / Settings

  /**
   * Port number of of daemon (default = 51935)
   */
  private port: number = TESTNET_PORT; // TODO: Mainnet / testnet flag...

  private username: string = 'test';
  private password: string = 'test';

  public isElectron: boolean = false;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService,
    private _posq: POSQService
  ) {
    this.isElectron = window.electron;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  /**
   * The call method will perform a single call to the posqd daemon and perform a callback to
   * the instance through the function as defined in the params.
   *
   * @param {string} method  The JSON-RPC method to call, see ```./posqd help```
   * @param {Array<Any>} params  The parameters to pass along with the JSON-RPC request.
   * The content of the array is of type any (ints, strings, booleans etc)
   *
   * @example
   * ```JavaScript
   * this._rpc.call('listtransactions', [0, 20]).subscribe(
   *              success => ...,
   *              error => ...);
   * ```
   */
  call(method: string, params?: Array<any> | null): Observable<any> {
    const [mMethod, mParams] = this._posq.callPOSQMap(method, params);
    if (!mMethod) {
      return new Observable((observer) => { observer.next(mParams)});
    }
    
    return this._ipc.runCommand('rpc-channel', null, mMethod, mParams)
      .pipe(
        mergeMap(response => fromPromise(this._posq.responsePOSQMap(method, params, response))),
        catchError(error => Observable.throw(typeof error._body || error === 'object'
            ? error._body || error
            : JSON.parse(error._body || error))
        )
      );
  }

  callGroup(method: string, groupParams: any[], params?: any[] | null): Observable<any> {
    const reqs = this._posq.callGroupPOSQMap(method, groupParams, params);
    const requests = reqs.map(x => {
      const [mMethod, mParams] = x;
      return this._ipc.runCommand('rpc-channel', null, mMethod, mParams);
    });

    return Observable.forkJoin(requests).pipe(
      mergeMap(response => fromPromise(this._posq.responseGroupPOSQMap(method, params, response))),
      catchError(error => Observable.throw(typeof error._body || error === 'object'
        ? error._body || error
        : JSON.parse(error._body || error))
      )
    );
  }
}
