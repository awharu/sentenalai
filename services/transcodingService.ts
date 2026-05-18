// System for handling stream ingestion and output for various protocols (HLS/WebRTC)
// Configured to interact with edge nodes or transcoding backends

const HLS_STATIC_SOURCES = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 
  'https://media.w3.org/2010/05/sintel/trailer.mp4',   
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

const RTC_ENDPOINTS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
];

export const startTranscodingSession = async (rtspUrl: string, latencyMode: 'STANDARD' | 'LOW_LATENCY' = 'STANDARD'): Promise<string> => {
  console.log(`[StreamService] Provisioning session: ${rtspUrl} [Mode: ${latencyMode}]`);
  
  // Validate format
  if (!rtspUrl.startsWith('rtsp://')) {
    throw new Error("Invalid protocol. Expected rtsp://");
  }

  // Return a deterministic playback URL based on the input
  const index = rtspUrl.length % 3;

  if (latencyMode === 'LOW_LATENCY') {
      return RTC_ENDPOINTS[index];
  } else {
      return HLS_STATIC_SOURCES[index];
  }
};