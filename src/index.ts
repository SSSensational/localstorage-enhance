import './polyfill';
import LocalStorageClass from './LocalStorage';
export { default as LocalStorageClass } from './LocalStorage';
export default new LocalStorageClass({ storageKey: 'localStorage_enhance', capacity: 1000, encrypt: false });
