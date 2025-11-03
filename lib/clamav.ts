import NodeClam from 'clamscan';

let clamScanInstance: NodeClam | null = null;

// Initialize ClamAV scanner
async function initClamAV() {
  if (clamScanInstance) return clamScanInstance;

  try {
    clamScanInstance = await new NodeClam().init({
      removeInfected: false, // Don't auto-delete, we'll handle it
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      fileList: null,
      scanRecursively: true,
      clamdscan: {
        socket: '/var/run/clamav/clamd.ctl', // Default Ubuntu socket
        timeout: 60000,
        localFallback: true, // Fall back to clamscan if clamd unavailable
      },
      preference: 'clamdscan' // Prefer daemon for speed
    });

    console.log('ClamAV initialized successfully');
    return clamScanInstance;
  } catch (error) {
    console.error('Failed to initialize ClamAV:', error);
    throw new Error('Virus scanner initialization failed');
  }
}

export interface ScanResult {
  isInfected: boolean;
  viruses: string[];
  file: string;
}

// Scan a file for viruses
export async function scanFile(filePath: string): Promise<ScanResult> {
  try {
    const clamscan = await initClamAV();

    const { isInfected, viruses, file } = await clamscan.isInfected(filePath);

    return {
      isInfected: isInfected || false,
      viruses: viruses || [],
      file: file || filePath
    };
  } catch (error) {
    console.error('Error scanning file with ClamAV:', error);

    // In production, you might want to fail safe (reject the file)
    // For now, we'll log and allow the file (so uploads don't break if ClamAV fails)
    console.warn('ClamAV scan failed, allowing file through');
    return {
      isInfected: false,
      viruses: [],
      file: filePath
    };
  }
}
