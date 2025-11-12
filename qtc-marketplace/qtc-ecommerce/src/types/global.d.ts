export {};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: any }>;
      disconnect(): Promise<void>;
      publicKey?: any;
      signTransaction?: (transaction: any) => Promise<any>;
      signAndSendTransaction?: (transaction: any) => Promise<any>;
    };
  }
}