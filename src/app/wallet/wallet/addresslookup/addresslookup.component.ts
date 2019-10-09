import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../core';

import { AddressHelper } from '../../../core/util/utils';
import { AddressLookUpCopy } from '../models/address-look-up-copy';
import { Contact } from './contact.model';

@Component({
  selector: 'app-addresslookup',
  templateUrl: './addresslookup.component.html',
  styleUrls: ['./addresslookup.component.scss']
})
export class AddressLookupComponent implements OnInit {

  @Output() selectAddressCallback: EventEmitter<AddressLookUpCopy> = new EventEmitter<AddressLookUpCopy>();

  @ViewChild('paginator') paginator: any;

  log: any = Log.create('addresslookup.component');

  public filter: string = 'All types';
  public allowFilter: boolean = true;
  public query: string = '';
  public searchResult: Contact[];
  private addressHelper: AddressHelper;

  public type: string = 'send';
  public addressTypes: Array<string> = ['All types', 'Public', 'Private'];

  private _addressCount: number;
  addressLookups: Contact[] = [];

  // @TODO: Move static pagination prams into global variable
  MAX_ADDRESSES_PER_PAGE: number = 5;
  // PAGE_SIZE_OPTIONS: Array<number> = [5, 10, 20];
  current_page: number = 1;

  constructor(private _rpc: RpcService,
              private dialogRef: MatDialogRef<AddressLookupComponent>) {
    this.addressHelper = new AddressHelper();
  }

  ngOnInit(): void {
    this.show();
    this.allowFilter = (this.filter === 'All types');
  }

  private toLowerCase(str: string): string {
    return (str || "").toLowerCase();
  }

  /** Returns a filtered addressLookups (query and filter) */
  getPageData(): Array<Object> {
    const query: string = this.query;
    this.searchResult = this.addressLookups.filter(el => (
        (  this.toLowerCase(el.getLabel()).indexOf(this.toLowerCase(query)) !== -1
        || this.toLowerCase(el.getAddress()).indexOf(this.toLowerCase(query)) !== -1)
        && ((this.filter === this.cheatPublicAddress(el.getAddress()))
        || (this.filter === 'All types'))
      )
    );
    return this.searchResult.slice(
      0 + ((this.current_page - 1) * this.MAX_ADDRESSES_PER_PAGE), this.current_page * this.MAX_ADDRESSES_PER_PAGE);
  }

  pageChanged(event: any): void {
    if (event.pageIndex !== undefined) {
      this.MAX_ADDRESSES_PER_PAGE = event.pageSize;
      this.current_page = event.pageIndex + 1;
    }
  }

  getTotalCountForPagination(): number {
    return this.searchResult.length;
  }

  inSearchMode(): boolean {
    return !!this.query;
  }

  // needs to change..
  cheatPublicAddress(address: string): string {
    return address.length > 35 ? 'Private' : 'Public';
  }

  show(): void {
    this.rpc_update();
  }

  rpc_update(): void {
    this._rpc.call('filteraddresses', [-1])
      .subscribe(
        (response: any) => {
          let typeInt: string;
          if (this.type === 'send') {
            typeInt = '2';
            this._addressCount = response.num_send;
          } else {
            this.filter = 'Private';
            typeInt = '1';
            this._addressCount = response.num_receive;
          }
          if (this._addressCount > 0) {
            this._rpc.call('filteraddresses', [0, this._addressCount, '0', '', typeInt])
              .subscribe(
                (success: any) => {
                  this.addressLookups = [];
                  success.forEach((contact) => {
                    if (this.type === 'send' || this.addressHelper.testAddress(contact.address, 'private')) {
                      this.addressLookups.push(new Contact(contact.label, contact.address));
                    } else if (this.type === 'sign' && this.addressHelper.testAddress(contact.address, 'public') && contact.owned) {
                      this.filter = 'Public';
                      this.addressLookups.push(new Contact(contact.label, contact.address));
                    }
                  })
                },
                error => this.log.er('error!', error));
          } else {
            this.addressLookups = [];
          }

        },
        (error: any) => this.log.er('rpc_update: filteraddresses Failed!', error));
  }

  onSelectAddress(address: string, label: string): void {
    const emitData: AddressLookUpCopy = {address: address, label: label};
    this.selectAddressCallback.emit(emitData);
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  // Reset pagination
  resetPagination(): void {
    this.current_page = 1;
    this.paginator.resetPagination(0);
  }

}
