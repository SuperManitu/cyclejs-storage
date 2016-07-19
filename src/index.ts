import xs, { Stream } from 'xstream';
import { StreamAdapter } from '@cycle/base';
import XStreamAdapter from '@cycle/xstream-adapter';

export interface IKeyValuePair
{
    key : string;
    value : any;
    target : 'session' | 'local';
}

export interface IStorageSource
{
    local : any;
    session : any;
}

export function makeStorageDriver() : Function {
    function httpDriver(write$ : Stream<IKeyValuePair>, runSA : StreamAdapter) : IStorageSource
    {
        const writeToStorage : (pair : IKeyValuePair) => void = pair => {
            const storage : any = pair.target === 'session' ? sessionStorage : localStorage;

            storage.setItem(pair.key, pair.value);
        };

        write$.addListener({
            next: writeToStorage,
            error: error => console.log(error),
            complete: () => {}
        });

        const select : (storage : any, key : string) => Stream<string> = (storage, key) => {
            return xs.of(storage.getItem(key));
        };

        return {
            local: { select: select.bind(undefined, localStorage) },
            session: { select: select.bind(undefined, sessionStorage) }
        };
    }

    (<any> httpDriver).streamAdapter = XStreamAdapter;
    return httpDriver;
}
