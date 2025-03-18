export interface Storage {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}
declare module 'probot' {
    interface Probot {
        storage: Storage;
    }
}
