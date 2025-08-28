import React, { useState, useEffect } from "react";
import { Client } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Plus, 
  Settings, 
  Users,
  Crown,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Edit
} from "lucide-react";
import { format } from "date-fns";

const BUSINESS_TYPES = ["gym", "salon", "spa", "fitness_studio", "beauty_clinic", "other"];
const SUBSCRIPTION_PLANS = ["starter", "professional", "enterprise"];
const AVAILABLE_FEATURES = [
  "lead_capture",
  "whatsapp_automation", 
  "appointment_booking",
  "analytics",
  "custom_templates",
  "api_access",
  "priority_support"
];

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "gym",
    contact_email: "",
    contact_phone: "",
    subscription_plan: "starter",
    features_enabled: ["lead_capture"],
    status: "trial",
    trial_ends_at: "",
    monthly_lead_limit: 100,
    whatsapp_phone: ""
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientList = await Client.list('-created_date');
      setClients(clientList);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
    setLoading(false);
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setFormData({
      business_name: "",
      business_type: "gym", 
      contact_email: "",
      contact_phone: "",
      subscription_plan: "starter",
      features_enabled: ["lead_capture"],
      status: "trial",
      trial_ends_at: "",
      monthly_lead_limit: 100,
      whatsapp_phone: ""
    });
    setShowCreateDialog(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({...client});
    setShowCreateDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        await Client.update(editingClient.id, formData);
      } else {
        await Client.create(formData);
      }
      setShowCreateDialog(false);
      loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features_enabled: prev.features_enabled?.includes(feature)
        ? prev.features_enabled.filter(f => f !== feature)
        : [...(prev.features_enabled || []), feature]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700",
      trial: "bg-blue-100 text-blue-700",
      suspended: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700"
    };
    return colors[status] || colors.trial;
  };

  const getPlanColor = (plan) => {
    const colors = {
      starter: "bg-blue-100 text-blue-700",
      professional: "bg-purple-100 text-purple-700",
      enterprise: "bg-amber-100 text-amber-700"
    };
    return colors[plan] || colors.starter;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
              <p className="text-slate-600 mt-1">Manage your SaaS clients and their subscriptions</p>
            </div>
          </div>
          <Button 
            onClick={handleCreateClient}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
                  <p className="text-sm text-slate-600">Total Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {clients.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-sm text-slate-600">Active Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {clients.filter(c => c.status === 'trial').length}
                  </p>
                  <p className="text-sm text-slate-600">Trial Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {clients.filter(c => c.subscription_plan === 'enterprise').length}
                  </p>
                  <p className="text-sm text-slate-600">Enterprise</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {clients.map((client) => (
                <div key={client.id} className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{client.business_name}</h3>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                          <Badge className={getPlanColor(client.subscription_plan)}>
                            {client.subscription_plan}
                          </Badge>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {client.business_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {client.contact_email}
                          </span>
                          {client.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {client.contact_phone}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {client.features_enabled?.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                        {client.trial_ends_at && client.status === 'trial' && (
                          <p className="text-xs text-amber-600 mt-2">
                            Trial ends: {format(new Date(client.trial_ends_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Edit Client' : 'Create New Client'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => setFormData({...formData, business_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subscription_plan">Subscription Plan</Label>
                  <Select
                    value={formData.subscription_plan}
                    onValueChange={(value) => setFormData({...formData, subscription_plan: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_PLANS.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Features Enabled</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.features_enabled?.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-purple-600">
                  {editingClient ? 'Update Client' : 'Create Client'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}