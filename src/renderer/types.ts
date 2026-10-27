export {};

declare global {
  interface Window {
    photopeaAPI?: {
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
      platform: string;
      getAppVersion: () => Promise<string>;
    };
  }
}
