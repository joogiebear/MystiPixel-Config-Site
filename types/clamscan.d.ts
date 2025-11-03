declare module 'clamscan' {
  interface ClamScanOptions {
    removeInfected?: boolean;
    quarantineInfected?: boolean;
    scanLog?: string | null;
    debugMode?: boolean;
    fileList?: string | null;
    scanRecursively?: boolean;
    clamdscan?: {
      socket?: string;
      host?: string;
      port?: number;
      timeout?: number;
      localFallback?: boolean;
      path?: string;
      configFile?: string;
      multiscan?: boolean;
      reloadDb?: boolean;
      active?: boolean;
      bypassTest?: boolean;
    };
    preference?: 'clamdscan' | 'clamscan';
  }

  interface ScanResult {
    isInfected: boolean;
    viruses: string[];
    file: string;
  }

  class NodeClam {
    constructor();
    init(options: ClamScanOptions): Promise<NodeClam>;
    isInfected(file: string): Promise<ScanResult>;
    scanDir(path: string): Promise<{
      goodFiles: string[];
      badFiles: string[];
      errors: any[];
      viruses: string[];
    }>;
  }

  export = NodeClam;
}
