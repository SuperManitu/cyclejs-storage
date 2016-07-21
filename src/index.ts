import xs, { Stream } from 'xstream';
import { StreamAdapter } from '@cycle/base';
import XStreamAdapter from '@cycle/xstream-adapter';

export interface SpecificKeyValuePair
{
    key : string;
    value : any;
}

export interface KeyValuePair extends SpecificKeyValuePair
{
    target : 'session' | 'local';
}

export interface SpecificStorageSource
{
    getItem : (key : string) => Stream<any>;
}

export interface StorageSource
{
    local : SpecificStorageSource;
    session : SpecificStorageSource;
}

export type specificStorageDriverType = (write$ : Stream<SpecificKeyValuePair>, runSA? : StreamAdapter) => SpecificStorageSource;
export type storageDriverType = (write$ : Stream<KeyValuePair>, runSA? : StreamAdapter) => StorageSource;

function specificStorageDriver(storage : any, write$ : Stream<SpecificKeyValuePair>, runSA : StreamAdapter) : SpecificStorageSource
{
    write$.addListener({
        next: pair => storage.setItem(pair.key, pair.value),
        error: error => console.log(error),
        complete: () => {}
    });

    return {
        getItem: (key : string) => xs.of(storage.getItem(key))
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
