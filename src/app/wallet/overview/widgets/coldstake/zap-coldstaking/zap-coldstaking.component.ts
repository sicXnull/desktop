import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../../core/util/utils';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService, RpcStateService, SnackbarService } from 'app/core';

@Component({
  selector: 'app-zap-coldstaking',
  templateUrl: './zap-coldstaking.component.html',
  styleUrls: ['./zap-coldstaking.component.scss']
})
export class ZapColdstakingComponent {

  private log: any = Log.create('zap-coldstaking');

  public utxos: any;
  fee: number;
  script: string;

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<ZapColdstakingComponent>,
    private _modals: ModalsService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {

    // TODO: move to coldstaking service
    /* TODO: use async / await, make return value useful, subscribe errors */

    this.utxos = {
      txs: [],
      amount: 0
    };

    this._rpc.call('walletsettings', ['changeaddress']).subscribe(res => {
      const pkey = res.changeaddress.coldstakingaddress;
      if (!pkey || pkey === '' || pkey === 'default') {
        return false;
      }

      this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(derived => {
        if (!derived || derived.length !== 1) {
          return false;
        }
        const coldstakingAddress = derived[0];

        this._rpc.call('listunspent').subscribe(unspent => {
          // TODO: Must process amounts as integers
          unspent.map(utxo => {
            if (utxo.coldstaking_address // found a cold staking utxo
              || !utxo.address) {
              // skip
            } else {
              this.utxos.amount += utxo.amount;
              this.utxos.txs.push({
                address: utxo.address,
                amount: utxo.amount,
                inputs: [{ tx: utxo.txid, n: utxo.vout }]
              });
            };
          });

          this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
          .subscribe(spendingAddress => {
            if (!spendingAddress || spendingAddress === '') {
              return false;
            }

            this._rpc.call('buildscript', [{
              recipe: 'ifcoinstake',
              addrstake: coldstakingAddress,
              addrspend: spendingAddress
            }]).subscribe(script => {
              if (!script || !script.hex) {
                return false;
              }
              this.script = script.hex;

              const amount = new Amount(this.utxos.amount, 8);

              this._rpc.call('sendtypeto', ['posq', 'posq', [{
                subfee: true,
                address: 'script',
                amount: amount.getAmount(),
                script: script.hex
              }], '', '', 4, 64, true, JSON.stringify({
                inputs: this.utxos.txs
              })]).subscribe(tx => {

                this.fee = tx.fee;

              });

            });
          });
        });
      });
    }, error => {
      this.log.er('err', error);
    });
  }

  zap() {
    const amount = new Amount(this.utxos.amount, 8);
    this._rpc.call('sendtypeto', ['posq', 'posq', [{
      subfee: true,
      address: 'script',
      amount: amount.getAmount(),
      script: this.script
    }], 'coldstaking zap', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(info => {
      this._rpcState.set('ui:coldstaking', true);

      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully zapped ${this.utxos.amount} POSQ to cold staking`, 'warn');
    });

  }

}
