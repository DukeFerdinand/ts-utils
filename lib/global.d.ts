import { SmartFetch } from "fetch";

declare global {
  interface Window { __SMART_FETCH_CONFIG__: SmartFetch.GlobalConfig | undefined }
  interface Global { __SMART_FETCH_CONFIG__: SmartFetch.GlobalConfig | undefined }
}