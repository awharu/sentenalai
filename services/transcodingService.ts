// Simulates a backend service (like MediaMTX or go2rtc) that ingests RTSP and outputs HLS/WebRTC
// In a real production env, this would call: POST /api/v1/streams/transcode

const MOCK_TRANSCODED_OUTPUTS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Big Buck Bunny (HLS)
  'https://media.w3.org/2010/05/sintel/trailer.mp4',   // Sintel (MP4)
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' // Tears of Steel (MP4)
];

export const startTranscodingSession = async (rtspUrl: string): Promise<string> => {
  console.log(`[Transcoder] Received request for: ${rtspUrl}`);
  
  // 1. Simulate network latency and container startup time (1.5s - 3s)
  const provisionTime = 1500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, provisionTime));

  // 2. Validate format (mock validation)
  if (!rtspUrl.startsWith('rtsp://')) {
    throw new Error("Invalid protocol. Expected rtsp://");
  }

  // 3. Return a deterministic playback URL based on the input length
  // This ensures the same RTSP url always gets the same 'mock' stream for the demo
  const index = rtspUrl.length % MOCK_TRANSCODED_OUTPUTS.length;
  const playbackUrl = MOCK_TRANSCODED_OUTPUTS[index];

  console.log(`[Transcoder] Stream provisioned. Playback at: ${playbackUrl}`);
  return playbackUrl;
};