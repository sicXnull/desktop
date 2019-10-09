import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../../core/util/utils';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService, RpcStateService, SnackbarService } from 'app/core';

@Component({
  selector: 'app-revert-coldstaking',
  templateUrl: './revert-coldstaking.component.html',
  styleUrls: ['./revert-coldstaking.component.scss']
})
export class RevertColdstakingComponent implements OnInit {

  private log: any = Log.create('revert-coldstaking');

  public fee: number = 0;
  public utxos: any = {
    txs: [],
    amount: 0
  };

  address: string;

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<RevertColdstakingComponent>,
    private _modals: ModalsService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
  ) { }

  ngOnInit() {
    this.utxos = {
      txs: [],
      amount: 0
    };

    this._rpc.call('liststealthaddresses', null)
      .subscribe(stealthAddresses => {
        try {
          this.address = stealthAddresses[0]['Stealth Addresses'][0]['Address'];
        } catch (err) {
          this.address = '';
          this.dialogRef.close();
          this.flashNotification.open(
            'No stealth address found, please add a stealthaddress.', 'error');
          return;
        };

        let sentTXs = 0;
        let totalFee = 0;

        this._rpc.call('listunspent').subscribe(unspent => {
          // TODO: Must process amounts as integers
          unspent.map(utxo => {
            if (!utxo.coldstaking_address
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

          this.utxos.txs.map(tx => {
            this._rpc.call('sendtypeto', ['posq', 'posq', [{
              subfee: true,
              address: this.address,
              amount: tx.amount
            }], '', '', 4, 64, true, JSON.stringify({
              inputs: tx.inputs
            })]).subscribe(res => {

              sentTXs++;
              totalFee += res.fee;

              if (sentTXs === this.utxos.txs.length) {
                this.fee = totalFee;
              }
            }, error => this.log.er('err: ', error));
          });
        });
      },
        error => this.log.er('err', error));
  }

  revert() {

    this.disableColdstaking();
    if (this.utxos.txs.length === 0) {
      this._rpcState.set('ui:coldstaking', false);
      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully disabled coldstaking, no transactions needed.`, 'warn');
      return ;
    }

    let sentTXs = 0;
    let amount = 0;
    this.utxos.txs.map(tx => {
      this._rpc.call('sendtypeto', ['posq', 'posq', [{
        subfee: true,
        address: this.address,
        amount: tx.amount
      }], 'revert coldstaking', '', 4, 64, false, JSON.stringify({
        inputs: tx.inputs
      })]).subscribe(res => {
        amount += tx.amount;

        if (++sentTXs === this.utxos.txs.length) {
          this._rpcState.set('ui:coldstaking', false);
          this.dialogRef.close();
          this.flashNotification.open(
            `Succesfully brought ${amount} POSQ into hot wallet`, 'warn');
        }
      });
    });

  }

  private disableColdstaking() {
    this._rpc.call('walletsettings', ['changeaddress', {}]).subscribe(res => {
      if (res.changeaddress !== 'cleared') {
        return false;
      }
    });
  }

}
