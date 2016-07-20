import xs, { Stream } from 'xstream';
import { StreamAdapter } from '@cycle/base';
import XStreamAdapter from '@cycle/xstream-adapter';

export interface ISpecificKeyValuePair
{
    key : string;
    value : any;
}

export interface IKeyValuePair extends ISpecificKeyValuePair
{
    target : 'session' | 'local';
}

export interface ISpecificStorageSource
{
    getItem : (key : string) => Stream<any>;
}

export interface IStorageSource
{
    local : ISpecificStorageSource;
    session : ISpecificStorageSource;
}

export type specificStorageDriverType = (write$ : Stream<ISpecificKeyValuePair>, runSA? : StreamAdapter) => ISpecificStorageSource;
export type storageDriverType = (write$ : Stream<IKeyValuePair>, runSA? : StreamAdapter) => IStorageSource;

function specificStorageDriver(storage : any, write$ : Stream<ISpecificKeyValuePair>, runSA : StreamAdapter) : ISpecificStorageSource
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

function storageDriver(write$ : Stream<IKeyValuePair>, runSA : StreamAdapter) : IStorageSource
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
