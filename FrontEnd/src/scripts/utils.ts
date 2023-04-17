import { Buffer } from 'buffer'

export function encode<T>(obj: T): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export function decode<T>(str: string): T {
    return JSON.parse(Buffer.from(str, 'base64').toString('ascii'))
}
