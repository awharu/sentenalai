import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Download, Activity, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { PredictiveInsight, SecurityReport } from '../types';
import { getPredictiveInsights, getReports, generateReport } from '../services/analyticsService';

export default function Analytics() {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const insightsData = await getPredictiveInsights();
    const reportsData = await getReports();
    setInsights(insightsData);
    setReports(reportsData);
  };

  const handleGenerateReport = async () => {
      setIsGenerating(true);
      const newRep = await generateReport('WEEKLY_SUMMARY');
      setReports(prev => [newRep, ...prev]);
      
      setTimeout(() => {
          setReports(prev => prev.map(r => r.id === newRep.id ? {...r, status: 'READY', downloadUrl: '#'} : r));
          setIsGenerating(false);
      }, 3000);
  };

  const getRiskColor = (prob: number) => {
      if (prob >= 80) return 'text-red-500';
      if (prob >= 50) return 'text-orange-500';
      return 'text-blue-500';
  };

  const getTrendIcon = (trend: string) => {
      switch(trend) {
          case 'UP': return <ArrowUpRight size={16} className="text-red-500" />;
          case 'DOWN': return <ArrowDownRight size={16} className="text-green-500" />;
          default: return <Minus size={16} className="text-slate-500" />;
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader 
        title="Predictive Analytics"
        description="AI-driven behavioral analysis and future threat forecasting."
        icon={TrendingUp}
      />

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
              <h3 className="text-sm text-slate-400 font-semibold uppercase mb-4">Overall Threat Forecast</h3>
              <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">Low</span>
                  <span className="text-green-500 font-medium mb-1 flex items-center gap-1">
                      <ArrowDownRight size={16} /> -12% vs last week
                  </span>
              </div>
              <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[25%] bg-green-500"></div>
              </div>
          </Card>

          <Card>
              <h3 className="text-sm text-slate-400 font-semibold uppercase mb-4">Projected Incidents (24h)</h3>
              <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">3</span>
                  <span className="text-orange-500 font-medium mb-1 flex items-center gap-1">
                      <ArrowUpRight size={16} /> Loitering High
                  </span>
              </div>
               <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-orange-500"></div>
              </div>
          </Card>

          <Card className="flex flex-col justify-between">
               <h3 className="text-sm text-slate-400 font-semibold uppercase">Quick Actions</h3>
               <div className="flex gap-2 mt-4">
                   <Button onClick={handleGenerateReport} isLoading={isGenerating} size="sm" className="flex-1">
                       Generate Summary
                   </Button>
                   <Button variant="outline" size="sm" className="flex-1">
                       Audit Rules
                   </Button>
               </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
          {/* Predictive Insights List */}
          <Card noPadding className="flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <Activity size={18} className="text-purple-500" />
                      Forecasted Risks
                  </h3>
                  <Badge variant="purple">AI Confidence: 92%</Badge>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {insights.map(insight => (
                      <div key={insight.id} className="bg-slate-800/30 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{insight.type.replace('_', ' ')}</span>
                                      {getTrendIcon(insight.trend)}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">{insight.location}</p>
                              </div>
                              <div className="text-right">
                                  <div className={`text-xl font-bold ${getRiskColor(insight.probability)}`}>
                                      {insight.probability}%
                                  </div>
                                  <div className="text-[10px] text-slate-500 uppercase">Probability</div>
                              </div>
                          </div>
                          <p className="text-sm text-slate-300 mb-3">{insight.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                              <Calendar size={12} />
                              <span>Predicted Window: <span className="text-white font-mono">{insight.timeWindow}</span></span>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>

          {/* Reporting Section */}
          <Card noPadding className="flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <FileText size={18} className="text-blue-500" />
                      Reporting Suite
                  </h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="text-xs uppercase text-slate-500 border-b border-slate-800">
                              <th className="pb-3 font-medium">Report Name</th>
                              <th className="pb-3 font-medium">Generated</th>
                              <th className="pb-3 font-medium text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {reports.map(report => (
                              <tr key={report.id}>
                                  <td className="py-4">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${report.status === 'GENERATING' ? 'bg-slate-800 animate-pulse' : 'bg-slate-800'}`}>
                                              {report.status === 'GENERATING' ? <RefreshCw size={16} className="animate-spin text-slate-500" /> : <FileText size={16} className="text-blue-500" />}
                                          </div>
                                          <div>
                                              <p className="text-sm font-medium text-white">{report.title}</p>
                                              <p className="text-[10px] text-slate-500 uppercase">{report.type.replace('_', ' ')}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="py-4 text-xs text-slate-400 font-mono">
                                      {new Date(report.generatedAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-4 text-right">
                                      {report.status === 'READY' ? (
                                          <button className="text-blue-500 hover:text-blue-400 p-2 hover:bg-slate-800 rounded transition-colors">
                                              <Download size={16} />
                                          </button>
                                      ) : (
                                          <span className="text-xs text-slate-500 italic">Processing...</span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      </div>
    </div>
  );
}