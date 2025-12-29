import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Mic, MicOff, Zap, Activity, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecurityAlert } from '../types';

// Mock function to get stats for the AI
const getSystemStats = () => {
    // In a real app, this would fetch from a global store
    const alerts = localStorage.getItem('sentinel_alerts');
    const parsedAlerts: SecurityAlert[] = alerts ? JSON.parse(alerts) : [];
    return {
        active_alerts: parsedAlerts.length || 3, // Fallback for demo
        system_status: 'ONLINE',
        threat_level: 'LOW'
    };
};

// Tool Definitions
const tools: FunctionDeclaration[] = [
    {
        name: 'navigate',
        description: 'Navigate to a specific page in the application.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                page: {
                    type: Type.STRING,
                    description: 'The page to navigate to. Options: dashboard, map, analytics, identities, access-control, search, audit-logs.',
                },
            },
            required: ['page'],
        },
    },
    {
        name: 'get_system_status',
        description: 'Get the current system status, alert count, and threat level.',
        parameters: {
            type: Type.OBJECT,
            properties: {},
        },
    }
];

export const VoiceCommandWidget: React.FC = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [volume, setVolume] = useState(0);

    // Refs for audio handling to avoid re-renders
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputContextRef = useRef<AudioContext | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const cleanup = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (inputContextRef.current) {
            inputContextRef.current.close();
            inputContextRef.current = null;
        }
        sessionPromiseRef.current = null;
        setStatus('idle');
        setVolume(0);
    };

    const toggleSession = async () => {
        if (isActive) {
            setIsActive(false);
            cleanup();
            return;
        }

        setIsActive(true);
        setStatus('connecting');
        setErrorMessage(null);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API Key missing");

            const ai = new GoogleGenAI({ apiKey });
            
            // Output Audio Context (24kHz)
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = audioCtx;
            nextStartTimeRef.current = audioCtx.currentTime;

            // Input Audio Context (16kHz)
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputContextRef.current = inputCtx;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: [{ functionDeclarations: tools }],
                    systemInstruction: `You are 'Sentinel', an advanced AI security assistant for a VMS platform. 
                    Keep responses concise, professional, and military-style. 
                    When asked to navigate, confirm the action briefly.
                    If reporting status, be precise.`,
                },
                callbacks: {
                    onopen: async () => {
                        console.log("Gemini Live Session Opened");
                        setStatus('listening');
                        
                        // Setup Microphone Stream
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        sourceRef.current = source;

                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        processorRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Simple volume meter
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) {
                                sum += inputData[i] * inputData[i];
                            }
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolume(Math.min(rms * 5, 1)); // Scale for visual

                            // Create PCM Blob
                            const pcmBlob = createBlob(inputData);
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then(session => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };

                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setStatus('speaking');
                            playAudioChunk(audioData, audioCtx);
                        }

                        // Handle Turn Complete (Reset status to listening)
                        if (msg.serverContent?.turnComplete) {
                            // Small delay to let audio finish
                            setTimeout(() => setStatus('listening'), 500); 
                        }

                        // Handle Tool Calls
                        if (msg.toolCall) {
                            console.log("Tool Call Received:", msg.toolCall);
                            const functionResponses = [];
                            
                            for (const fc of msg.toolCall.functionCalls) {
                                let result = {};
                                
                                if (fc.name === 'navigate') {
                                    const page = (fc.args as any).page?.toLowerCase();
                                    const routeMap: Record<string, string> = {
                                        'dashboard': '/',
                                        'map': '/map',
                                        'analytics': '/analytics',
                                        'identities': '/identities',
                                        'access-control': '/access-control',
                                        'search': '/search',
                                        'audit-logs': '/audit-logs'
                                    };
                                    
                                    const path = routeMap[page];
                                    if (path) {
                                        navigate(path);
                                        result = { success: true, message: `Navigating to ${page}` };
                                    } else {
                                        result = { success: false, message: "Page not found" };
                                    }
                                } 
                                else if (fc.name === 'get_system_status') {
                                    result = getSystemStats();
                                }

                                functionResponses.push({
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result }
                                });
                            }

                            // Send Tool Response
                            sessionPromiseRef.current?.then(session => {
                                session.sendToolResponse({ functionResponses });
                            });
                        }
                    },
                    onclose: () => {
                        console.log("Session Closed");
                        setIsActive(false);
                        cleanup();
                    },
                    onerror: (err) => {
                        console.error("Session Error", err);
                        setErrorMessage("Connection failed");
                        setIsActive(false);
                        cleanup();
                    }
                }
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (e) {
            console.error("Initialization Failed", e);
            setErrorMessage("Failed to init audio");
            setIsActive(false);
        }
    };

    // Helper: Create PCM Blob (16kHz)
    const createBlob = (data: Float32Array) => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        // Manual Base64 Encode
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        return {
            data: btoa(binary),
            mimeType: 'audio/pcm;rate=16000'
        };
    };

    // Helper: Play Audio Chunk (24kHz)
    const playAudioChunk = async (base64: string, ctx: AudioContext) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        const now = ctx.currentTime;
        // Schedule next chunk
        const start = Math.max(now, nextStartTimeRef.current);
        source.start(start);
        nextStartTimeRef.current = start + buffer.duration;
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
            {isActive && (
                <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl w-64 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Activity className={`w-4 h-4 ${status === 'speaking' ? 'text-green-400 animate-pulse' : 'text-blue-400'}`} />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {status === 'connecting' ? 'Connecting...' : status === 'speaking' ? 'Sentinel Speaking' : 'Listening...'}
                            </span>
                        </div>
                        <button onClick={toggleSession} className="text-slate-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    
                    {/* Visualizer */}
                    <div className="h-12 flex items-center justify-center gap-1 bg-black/40 rounded-lg overflow-hidden border border-slate-800">
                        {status === 'connecting' ? (
                            <div className="text-xs text-slate-500 font-mono">Initializing Uplink...</div>
                        ) : (
                            Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                    key={i}
                                    className={`w-1.5 rounded-full transition-all duration-75 ${status === 'speaking' ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ 
                                        height: `${Math.max(10, Math.random() * (volume * 100))}%`,
                                        opacity: Math.max(0.3, volume * 1.5)
                                    }}
                                />
                            ))
                        )}
                    </div>
                    
                    <div className="mt-2 text-[10px] text-slate-500 text-center">
                        Say "Navigate to Dashboard" or "System Status"
                    </div>
                </div>
            )}

            <button 
                onClick={toggleSession}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 ${
                    isActive 
                        ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                        : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 hover:scale-105'
                }`}
                title="Voice Command Center"
            >
                {isActive ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
        </div>
    );
};