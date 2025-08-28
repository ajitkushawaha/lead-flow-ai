import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp,
  Target,
  Users,
  Calendar,
  Zap,
  CheckCircle,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { eachMonthOfInterval, format, startOfYear, endOfYear } from 'date-fns';

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const leadList = await Lead.list();
      setLeads(leadList);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setLoading(false);
  };
  
  const totalLeads = leads.length;
  const totalConverted = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

  const funnelData = [
    { value: totalLeads, name: 'New', fill: '#3b82f6' },
    { value: leads.filter(l => ['contacted', 'interested', 'appointment_booked', 'converted'].includes(l.status)).length, name: 'Contacted', fill: '#8b5cf6' },
    { value: leads.filter(l => ['interested', 'appointment_booked', 'converted'].includes(l.status)).length, name: 'Interested', fill: '#ec4899' },
    { value: leads.filter(l => ['appointment_booked', 'converted'].includes(l.status)).length, name: 'Appointment', fill: '#f59e0b' },
    { value: totalConverted, name: 'Converted', fill: '#10b981' },
  ];

  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || 'manual';
    if (!acc[source]) acc[source] = { leads: 0, converted: 0 };
    acc[source].leads++;
    if (lead.status === 'converted') acc[source].converted++;
    return acc;
  }, {});
  
  const sourceChartData = Object.keys(sourceData).map(key => ({
    name: key.replace('_', ' ').toUpperCase(),
    leads: sourceData[key].leads,
    converted: sourceData[key].converted
  }));
  
  const monthlyData = leads.reduce((acc, lead) => {
    const month = format(new Date(lead.created_date), 'MMM');
    if(!acc[month]) acc[month] = {leads: 0, converted: 0};
    acc[month].leads++;
    if (lead.status === 'converted') acc[month].converted++;
    return acc;
  }, {});
  
  const yearMonths = eachMonthOfInterval({start: startOfYear(new Date()), end: endOfYear(new Date())});
  const monthlyChartData = yearMonths.map(monthDate => {
    const monthName = format(monthDate, 'MMM');
    return {
      name: monthName,
      leads: monthlyData[monthName]?.leads || 0,
      converted: monthlyData[monthName]?.converted || 0
    }
  });


  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">Measure your performance and find insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Leads" value={totalLeads} icon={Users} color="blue" />
          <StatCard title="Converted Leads" value={totalConverted} icon={CheckCircle} color="green" />
          <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} color="amber" />
          <StatCard title="Appointments Booked" value={leads.filter(l => l.status === 'appointment_booked').length} icon={Calendar} color="purple" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader><CardTitle>Performance This Year</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="New Leads" />
                  <Bar dataKey="converted" fill="#10b981" name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader><CardTitle>Lead Funnel</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(value) => `${value} (${Math.round((value/totalLeads)*100)}%)`} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader><CardTitle>Effectiveness by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sourceChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3b82f6" name="Total Leads" />
                <Bar dataKey="converted" fill="#10b981" name="Converted Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}