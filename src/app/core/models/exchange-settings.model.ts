import { ExchangeType } from "./exchange-type.enum";

export class IExchangeSetting {
    public name: string;
    public value: ExchangeType;
    public enabled?: boolean;
}

export class ExchangeSettingsHelper {
    public static getSettings(enabled?: ExchangeType[]): IExchangeSetting[] {
        enabled = enabled || [];

        return [{
            name: 'Coinlib',
            value: ExchangeType.Coinlib,
            enabled: enabled.indexOf(ExchangeType.Coinlib) >= 0
        }, {
            name: 'CoinGecko',
            value: ExchangeType.CoinGecko,
            enabled: enabled.indexOf(ExchangeType.CoinGecko) >= 0
        }, {
            name: 'Average',
            value: ExchangeType.Average,
            enabled: enabled.indexOf(ExchangeType.Average) >= 0
        }];
    }
}
