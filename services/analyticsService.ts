import { HeatmapPoint, PredictiveInsight, SecurityReport } from "../types";

// Mock Data for Predictive Insights
const MOCK_INSIGHTS: PredictiveInsight[] = [
    {
        id: 'pred_1',
        type: 'LOITERING',
        location: 'Loading Dock',
        probability: 85,
        timeWindow: '02:00 AM - 04:00 AM',
        description: 'Recurrent loitering pattern detected post-delivery hours. Suggested patrol increase.',
        trend: 'UP'
    },
    {
        id: 'pred_2',
        type: 'CROWD_SURGE',
        location: 'Main Lobby',
        probability: 60,
        timeWindow: '08:45 AM - 09:15 AM',
        description: 'Anticipated high foot traffic due to scheduled event check-ins.',
        trend: 'STABLE'
    },
    {
        id: 'pred_3',
        type: 'UNUSUAL_ACCESS',
        location: 'Server Room Hallway',
        probability: 35,
        timeWindow: 'Weekends',
        description: 'Slight deviation in access logs compared to 30-day baseline.',
        trend: 'DOWN'
    }
];

// Mock Reports
const MOCK_REPORTS: SecurityReport[] = [
    { id: 'rep_1', title: 'Weekly Security Summary (Week 42)', generatedAt: Date.now() - 86400000 * 2, type: 'WEEKLY_SUMMARY', status: 'READY', downloadUrl: '#' },
    { id: 'rep_2', title: 'Incident Report: UNAUTH_ACCESS_092', generatedAt: Date.now() - 86400000 * 5, type: 'INCIDENT_REPORT', status: 'READY', downloadUrl: '#' },
    { id: 'rep_3', title: 'Monthly Access Audit', generatedAt: Date.now() - 86400000 * 15, type: 'ACCESS_AUDIT', status: 'READY', downloadUrl: '#' }
];

export const getPredictiveInsights = async (): Promise<PredictiveInsight[]> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_INSIGHTS];
};

export const getReports = async (): Promise<SecurityReport[]> => {
    return [...MOCK_REPORTS];
};

export const generateReport = async (type: SecurityReport['type']): Promise<SecurityReport> => {
    const newReport: SecurityReport = {
        id: `rep_${Date.now()}`,
        title: `${type === 'WEEKLY_SUMMARY' ? 'Weekly Summary' : 'Ad-hoc Report'} - ${new Date().toLocaleDateString()}`,
        generatedAt: Date.now(),
        type,
        status: 'GENERATING'
    };
    
    // Simulate generation
    setTimeout(() => {
        newReport.status = 'READY';
        newReport.downloadUrl = '#';
    }, 3000);

    return newReport;
};

// Generates simulated heatmap data for a given zone
export const getHeatmapData = async (zoneId: string): Promise<HeatmapPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const points: HeatmapPoint[] = [];
    const count = 50 + Math.floor(Math.random() * 50);

    // Create a few "hotspots" depending on zoneId
    const centers = zoneId === 'zone_a' 
        ? [{x: 45, y: 80}, {x: 65, y: 30}] // Lobby & Server Room
        : [{x: 20, y: 20}, {x: 80, y: 60}]; // Perimeter points

    for (let i = 0; i < count; i++) {
        const center = centers[Math.floor(Math.random() * centers.length)];
        // Gaussian distribution around centers
        const x = Math.min(100, Math.max(0, center.x + (Math.random() - 0.5) * 20));
        const y = Math.min(100, Math.max(0, center.y + (Math.random() - 0.5) * 20));
        
        points.push({
            x,
            y,
            intensity: 0.3 + Math.random() * 0.7
        });
    }

    return points;
};