export enum TxType {
  PUBLIC = 'posq',
  BLIND = 'blind',
  ANON = 'anon',
  FIAT = 'usd'
}

export class TransactionBuilder {
  input: TxType = TxType.PUBLIC;
  output: TxType = TxType.PUBLIC;
  toAddress: string;
  toLabel: string;
  address: string;
  amount: number;
  comment: string;
  commentTo: string;
  numsignatures: number = 1;
  validAddress: boolean;
  validAmount: boolean;
  isMine: boolean;
  currency: string = 'posq';
  ringsize: number = 8;
  subtractFeeFromAmount: boolean = false;
  estimateFeeOnly: boolean = true;
  convertedAmount: string = '0 USD';

  public getPOSQAmount(prices: any): number {
    if (this.currency === 'usd') {
      return this.convertAmount(prices);
    }

    return this.amount;
  }

  public getConvertionCurrency(): string {
    return this.currency === 'part' ? 'USD' : 'POSQ';
  }

  private convertAmount(prices: any): number {
    if (this.currency === 'usd') {
      return parseFloat(parseFloat((this.amount / prices.usd).toString()).toFixed(8));
    } else {
      return parseFloat(parseFloat((this.amount * prices.usd).toString()).toFixed(8));
    }
  }

  public getConvertedAmount(prices: any): string {
    const conversionCurrency = this.getConvertionCurrency();
    
    if (!this.amount || isNaN(parseInt(this.amount.toString())) || !prices) {
      return `0 ${conversionCurrency}`; 
    }

    const convertedAmount = this.convertAmount(prices);
    return `${convertedAmount.toLocaleString()} ${conversionCurrency}`;
  }

  public prepare(prices: any): void {
    if (this.currency === 'usd') {
      this.amount = this.getPOSQAmount(prices);
      this.currency = 'part';
    }
  }

  public getCurrency(): string {
    if (this.currency === 'part') {
      return 'posq';
    }

    return this.currency;
  }

  constructor() {

  }
}
