// Simulates a backend service (like MediaMTX or go2rtc) that ingests RTSP and outputs HLS/WebRTC
// In a real production env, this would call: POST /api/v1/streams/transcode

const MOCK_HLS_OUTPUTS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Big Buck Bunny (HLS)
  'https://media.w3.org/2010/05/sintel/trailer.mp4',   // Sintel (MP4)
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' // Tears of Steel (MP4)
];

// Mock WebRTC (WHEP) endpoints - in a real app these would be wss:// or http://.../whep
const MOCK_WEBRTC_OUTPUTS = [
    'mock-webrtc://stream-01',
    'mock-webrtc://stream-02',
    'mock-webrtc://stream-03'
];

export const startTranscodingSession = async (rtspUrl: string, latencyMode: 'STANDARD' | 'LOW_LATENCY' = 'STANDARD'): Promise<string> => {
  console.log(`[Transcoder] Received request for: ${rtspUrl} [Mode: ${latencyMode}]`);
  
  // 1. Simulate network latency and container startup time (1.5s - 3s)
  const provisionTime = 1500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, provisionTime));

  // 2. Validate format (mock validation)
  if (!rtspUrl.startsWith('rtsp://')) {
    throw new Error("Invalid protocol. Expected rtsp://");
  }

  // 3. Return a deterministic playback URL based on the input length
  const index = rtspUrl.length % 3;

  if (latencyMode === 'LOW_LATENCY') {
      console.log(`[Transcoder] WebRTC (go2rtc) session established.`);
      return MOCK_WEBRTC_OUTPUTS[index];
  } else {
      console.log(`[Transcoder] HLS (ffmpeg) session established.`);
      return MOCK_HLS_OUTPUTS[index];
  }
};