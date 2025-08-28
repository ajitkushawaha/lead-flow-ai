import React, { useState, useEffect } from "react";
import { Lead, Client, Appointment, MessageAutomation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Phone,
  Mail,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    appointments: 0,
    conversionRate: 0,
    activeAutomations: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock chart data
  const leadTrendData = [
    { name: 'Mon', leads: 12, converted: 3 },
    { name: 'Tue', leads: 19, converted: 5 },
    { name: 'Wed', leads: 15, converted: 4 },
    { name: 'Thu', leads: 22, converted: 7 },
    { name: 'Fri', leads: 28, converted: 9 },
    { name: 'Sat', leads: 31, converted: 12 },
    { name: 'Sun', leads: 25, converted: 8 }
  ];

  const sourceData = [
    { name: 'Meta Ads', value: 45, color: '#3b82f6' },
    { name: 'Google Ads', value: 35, color: '#10b981' },
    { name: 'Website', value: 15, color: '#f59e0b' },
    { name: 'Referrals', value: 5, color: '#8b5cf6' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const leads = await Lead.list('-created_date', 50);
      const appointments = await Appointment.list('-appointment_date', 20);
      const automations = await MessageAutomation.list();

      // Calculate stats
      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newLeadsCount = leads.filter(lead => 
        new Date(lead.created_date) >= thisWeek
      ).length;
      
      const convertedLeads = leads.filter(lead => 
        lead.status === 'converted'
      ).length;
      
      const todayAppointmentsList = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === today.toDateString();
      });

      setStats({
        totalLeads: leads.length,
        newLeads: newLeadsCount,
        appointments: todayAppointmentsList.length,
        conversionRate: leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0,
        activeAutomations: automations.filter(a => a.is_active).length
      });

      setRecentLeads(leads.slice(0, 5));
      setTodayAppointments(todayAppointmentsList);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500 text-blue-500",
      green: "bg-green-500 text-green-500", 
      amber: "bg-amber-500 text-amber-500",
      purple: "bg-purple-500 text-purple-500",
      red: "bg-red-500 text-red-500"
    };

    return (
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className={`absolute top-0 right-0 w-32 h-32 ${colorClasses[color].split(' ')[0]} opacity-5 rounded-full transform translate-x-16 -translate-y-16`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {trend && (
                <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`p-4 rounded-xl ${colorClasses[color].split(' ')[0]} bg-opacity-10`}>
              <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Monitor your lead generation and conversions</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Leads")}>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Users className="w-4 h-4 mr-2" />
                View All Leads
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            title="Total Leads" 
            value={stats.totalLeads}
            icon={Users}
            trend="+12% this week"
            color="blue"
          />
          <StatCard 
            title="New This Week" 
            value={stats.newLeads}
            icon={Target}
            trend="+5 since yesterday"
            color="green"
          />
          <StatCard 
            title="Today's Appointments" 
            value={stats.appointments}
            icon={Calendar}
            color="purple"
          />
          <StatCard 
            title="Conversion Rate" 
            value={`${stats.conversionRate}%`}
            icon={TrendingUp}
            trend="+3% vs last week"
            color="amber"
          />
          <StatCard 
            title="Active Automations" 
            value={stats.activeAutomations}
            icon={Zap}
            color="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <TrendingUp className="w-5 h-5" />
                Lead Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={leadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="converted" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Target className="w-5 h-5" />
                Lead Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-900">
                  <Users className="w-5 h-5" />
                  Recent Leads
                </span>
                <Link to={createPageUrl("Leads")}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900">{lead.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 capitalize">
                          {lead.source?.replace('_', ' ')} • {lead.service_interest}
                        </p>
                      </div>
                      <Badge variant={
                        lead.status === 'new' ? 'default' :
                        lead.status === 'converted' ? 'success' : 'secondary'
                      }>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentLeads.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No leads yet</p>
                    <p className="text-sm">Import leads or connect your ad accounts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-900">
                  <Calendar className="w-5 h-5" />
                  Today's Appointments
                </span>
                <Link to={createPageUrl("Appointments")}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900">{appointment.customer_name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{appointment.service}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                      <Badge variant={
                        appointment.status === 'scheduled' ? 'default' :
                        appointment.status === 'confirmed' ? 'success' :
                        appointment.status === 'completed' ? 'secondary' : 'destructive'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {todayAppointments.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No appointments today</p>
                    <p className="text-sm">Your schedule is clear</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}