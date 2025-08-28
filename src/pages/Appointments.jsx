import React, { useState, useEffect } from "react";
import { Appointment, Lead } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, User, Briefcase, StickyNote } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, getDay } from "date-fns";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      // In a real scenario, you'd filter appointments on the backend
      const appointmentList = await Appointment.list();
      const filteredAppointments = appointmentList.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= start && aptDate <= end;
      });
      setAppointments(filteredAppointments);
      
      const leadList = await Lead.list();
      setLeads(leadList);

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const openCreateDialog = (date) => {
    setSelectedDate(date);
    setFormData({
      customer_name: "",
      customer_phone: "",
      service: "",
      appointment_date: format(date, "yyyy-MM-dd'T'10:00"),
      duration_minutes: 60,
      status: "scheduled",
      notes: "",
      client_id: "demo-client-1"
    });
    setShowDialog(true);
  };

  const handleLeadSelect = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if(lead) {
      setFormData(prev => ({
        ...prev,
        lead_id: lead.id,
        customer_name: lead.name,
        customer_phone: lead.phone
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Appointment.create(formData);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const CalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        {weekdays.map(day => (
          <div key={day} className="text-center py-2 bg-slate-50 text-xs font-semibold text-slate-600">{day}</div>
        ))}
        {days.map(day => {
          const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.appointment_date), day));
          return (
            <div 
              key={day.toString()}
              className={`p-2 min-h-[120px] bg-white relative group transition-colors ${
                !isSameMonth(day, monthStart) ? 'bg-slate-50' : ''
              } ${isSameDay(day, new Date()) ? 'border-2 border-amber-400' : ''} ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className={`text-sm font-medium ${!isSameMonth(day, monthStart) ? 'text-slate-400' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayAppointments.slice(0, 2).map(apt => (
                  <div key={apt.id} className="p-1 text-xs bg-blue-100 text-blue-800 rounded truncate">{apt.service}</div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-slate-500 font-medium">+{dayAppointments.length - 2} more</div>
                )}
              </div>
              <Button size="sm" variant="ghost" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => openCreateDialog(day)}>
                <Plus className="w-4 h-4"/>
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const DailyAppointmentsList = () => {
    const dayAppointments = appointments
      .filter(apt => isSameDay(new Date(apt.appointment_date), selectedDate))
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Appointments for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {dayAppointments.length > 0 ? (
            <div className="space-y-4">
              {dayAppointments.map(apt => (
                <div key={apt.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-slate-900">{apt.service}</h4>
                    <Badge variant={apt.status === "confirmed" ? "success" : "secondary"}>{apt.status}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 mt-2">
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4"/>{format(new Date(apt.appointment_date), 'p')} ({apt.duration_minutes} min)</p>
                    <p className="flex items-center gap-2"><User className="w-4 h-4"/>{apt.customer_name}</p>
                    {apt.notes && <p className="flex items-center gap-2"><StickyNote className="w-4 h-4"/>{apt.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">No appointments scheduled for this day.</p>
              <Button variant="link" className="mt-2" onClick={() => openCreateDialog(selectedDate)}>Schedule one now</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
              <p className="text-slate-600 mt-1">Manage your schedule and bookings</p>
            </div>
          </div>
          <Button onClick={() => openCreateDialog(new Date())} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6">
              <CalendarHeader />
              <CalendarGrid />
            </Card>
          </div>
          <div>
            <DailyAppointmentsList />
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Appointment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lead">Link to Lead (optional)</Label>
              <Select onValueChange={handleLeadSelect}>
                <SelectTrigger><SelectValue placeholder="Select a lead..." /></SelectTrigger>
                <SelectContent>
                  {leads.map(lead => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="customer_name">Customer Name</Label><Input id="customer_name" value={formData?.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} required /></div>
            <div><Label htmlFor="customer_phone">Customer Phone</Label><Input id="customer_phone" value={formData?.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} /></div>
            <div><Label htmlFor="service">Service</Label><Input id="service" value={formData?.service} onChange={e => setFormData({...formData, service: e.target.value})} required /></div>
            <div><Label htmlFor="appointment_date">Date & Time</Label><Input id="appointment_date" type="datetime-local" value={formData?.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} required /></div>
            <div><Label htmlFor="notes">Notes</Label><Input id="notes" value={formData?.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button type="submit">Create Appointment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}