import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Upload,
  Phone,
  Mail,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { format } from "date-fns";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter]);

  const loadLeads = async () => {
    try {
      const leadList = await Lead.list('-created_date');
      setLeads(leadList);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setLoading(false);
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            leads: {
              type: "array",
              items: Lead.schema()
            }
          }
        }
      });

      if (result.status === "success" && result.output?.leads) {
        const leadsToCreate = result.output.leads.map(lead => ({
          ...lead,
          source: "csv_import",
          client_id: "demo-client-1" // In real app, this would be the current user's client ID
        }));

        await Lead.bulkCreate(leadsToCreate);
        loadLeads();
        setShowImportDialog(false);
      }
    } catch (error) {
      console.error("Error importing leads:", error);
    }
    setImporting(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      contacted: "bg-yellow-100 text-yellow-700",
      interested: "bg-purple-100 text-purple-700",
      appointment_booked: "bg-green-100 text-green-700",
      converted: "bg-emerald-100 text-emerald-700",
      lost: "bg-red-100 text-red-700"
    };
    return colors[status] || colors.new;
  };

  const getSourceColor = (source) => {
    const colors = {
      meta_ads: "bg-blue-100 text-blue-700",
      google_ads: "bg-green-100 text-green-700",
      website: "bg-purple-100 text-purple-700",
      referral: "bg-orange-100 text-orange-700",
      csv_import: "bg-gray-100 text-gray-700",
      manual: "bg-slate-100 text-slate-700"
    };
    return colors[source] || colors.manual;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Lead Management</h1>
              <p className="text-slate-600 mt-1">Track and convert your leads</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
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
                  <p className="text-2xl font-bold text-slate-900">{leads.length}</p>
                  <p className="text-sm text-slate-600">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {leads.filter(l => l.status === 'new').length}
                  </p>
                  <p className="text-sm text-slate-600">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {leads.filter(l => l.status === 'converted').length}
                  </p>
                  <p className="text-sm text-slate-600">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) || 0}%
                  </p>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="csv_import">CSV Import</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getSourceColor(lead.source)}>
                          {lead.source.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(lead.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {lead.service_interest && (
                        <p className="text-sm text-slate-600 mt-2">
                          Interested in: <span className="font-medium">{lead.service_interest}</span>
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic">{lead.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No leads found</h3>
                  <p className="text-slate-500">Import leads or connect your ad accounts to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Leads from CSV</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file with columns: name, phone, email, source, service_interest, notes
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={importing}
              />
              {importing && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  Processing CSV file...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}