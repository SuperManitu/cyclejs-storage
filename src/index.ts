import xs, { Stream } from 'xstream';
import { StreamAdapter } from '@cycle/base';
import XStreamAdapter from '@cycle/xstream-adapter';

export interface SpecificKeyValuePair
{
    key : string;
    value : any;
    action? : 'setItem' | 'removeItem' | 'clear';
}

export interface KeyValuePair extends SpecificKeyValuePair
{
    target : 'session' | 'local';
}

export interface SpecificStorageSource
{
    getItem : (key : string) => any; // Both results are streams in the library of choice
    nthKey : (n : number) => any;
}

export interface StorageSource
{
    local : SpecificStorageSource;
    session : SpecificStorageSource;
}

export type specificStorageDriverType = (write$ : Stream<SpecificKeyValuePair>, runSA? : StreamAdapter) => SpecificStorageSource;
export type storageDriverType = (write$ : Stream<KeyValuePair>, runSA? : StreamAdapter) => StorageSource;

function adapt(storage : any, write$ : Stream<SpecificKeyValuePair>, runSA : StreamAdapter, extractor : (storage : any) => any)
{
    return runSA.adapt(write$.map(p => p.value).startWith(extractor(storage)), XStreamAdapter.streamSubscribe);
}

function specificStorageDriver(storage : any, write$ : Stream<SpecificKeyValuePair>, runSA : StreamAdapter) : SpecificStorageSource
{
    write$.addListener({
        next: req => {
          var action = req.action || 'setItem';
          storage[action](req.key, req.value);
        },
        error: () => {},
        complete: () => {}
    });

    return {
        getItem: (key : string) => adapt(storage, write$, runSA, s => s.getItem(key)),
        nthKey: (n : number) => adapt(storage, write$, runSA, s => s.key(n)),
    };
}

function storageDriver(write$ : Stream<KeyValuePair>, runSA : StreamAdapter) : StorageSource
{
    return {
        session: specificStorageDriver(sessionStorage, write$.filter(pair => pair.target === 'session'), runSA),
        local: specificStorageDriver(localStorage, write$.filter(pair => pair.target === 'local'), runSA)
    };
}

function bindAdapter(f : Function) : Function
{
    (<any> f).streamAdapter = XStreamAdapter;
    return f;
}

export function makeLocalStorageDriver() : specificStorageDriverType {
    return bindAdapter(specificStorageDriver.bind(undefined, localStorage)) as specificStorageDriverType;
}

export function makeSessionStorageDriver() : specificStorageDriverType {
    return bindAdapter(specificStorageDriver.bind(undefined, sessionStorage)) as specificStorageDriverType;
}

export function makeStorageDriver() : storageDriverType {
    return bindAdapter(storageDriver) as storageDriverType;
}
