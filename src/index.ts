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

export function makeLocalStorageDriver() : Function {
    return bindAdapter(specificStorageDriver.bind(undefined, localStorage));
}

export function makeSessionStorageDriver() : Function {
    return bindAdapter(specificStorageDriver.bind(undefined, sessionStorage));
}

export function makeStorageDriver() : Function {
    return bindAdapter(storageDriver);
}
