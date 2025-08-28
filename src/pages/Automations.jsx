import React, { useState, useEffect } from "react";
import { MessageAutomation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Zap, 
  Plus, 
  Clock,
  MessageSquare,
  Trash2,
  Key,
  Calendar,
  Rocket
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TRIGGER_TYPES = ["new_lead", "keyword_match", "status_change", "scheduled"];

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const automationList = await MessageAutomation.list('-created_date');
      setAutomations(automationList);
    } catch (error) {
      console.error("Error loading automations:", error);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setEditingAutomation(null);
    setFormData({
      name: "",
      trigger_type: "new_lead",
      trigger_keywords: [],
      message_sequence: [{ delay_minutes: 5, message_text: "", has_booking_link: false }],
      is_active: true,
      business_hours_only: true,
      client_id: "demo-client-1"
    });
    setShowDialog(true);
  };

  const openEditDialog = (automation) => {
    setEditingAutomation(automation);
    setFormData({ ...automation });
    setShowDialog(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleKeywordChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    handleFormChange('trigger_keywords', keywords);
  };

  const handleSequenceChange = (index, field, value) => {
    const newSequence = [...formData.message_sequence];
    newSequence[index] = { ...newSequence[index], [field]: value };
    handleFormChange('message_sequence', newSequence);
  };

  const addMessageStep = () => {
    const newSequence = [...formData.message_sequence, { delay_minutes: 60, message_text: "", has_booking_link: false }];
    handleFormChange('message_sequence', newSequence);
  };
  
  const removeMessageStep = (index) => {
    const newSequence = formData.message_sequence.filter((_, i) => i !== index);
    handleFormChange('message_sequence', newSequence);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    try {
      if (editingAutomation) {
        await MessageAutomation.update(editingAutomation.id, formData);
      } else {
        await MessageAutomation.create(formData);
      }
      setShowDialog(false);
      loadAutomations();
    } catch (error) {
      console.error("Error saving automation:", error);
    }
  };

  const AutomationCard = ({ automation }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{automation.name}</CardTitle>
        <div className="flex items-center gap-3">
          <Badge variant={automation.is_active ? "success" : "secondary"}>
            {automation.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(automation)}>Edit</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Rocket className="w-4 h-4 text-purple-500" />
          <span>Trigger: <strong className="capitalize">{automation.trigger_type.replace('_', ' ')}</strong></span>
        </div>
        {automation.trigger_type === 'keyword_match' && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Key className="w-4 h-4 text-amber-500 mt-1" />
            <div>
              <p>Keywords:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {automation.trigger_keywords.map(kw => <Badge key={kw} variant="outline">{kw}</Badge>)}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>{automation.message_sequence.length} Message(s) in sequence</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Message Automations</h1>
              <p className="text-slate-600 mt-1">Create automated WhatsApp conversations</p>
            </div>
          </div>
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {automations.map((automation) => (
              <motion.div
                key={automation.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AutomationCard automation={automation} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {automations.length === 0 && !loading && (
          <div className="text-center py-16 bg-white/50 rounded-xl">
            <Zap className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No Automations Yet</h3>
            <p className="text-slate-500 mb-4">Click "New Automation" to create your first message flow.</p>
            <Button onClick={openCreateDialog}>Create Your First Automation</Button>
          </div>
        )}
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAutomation ? 'Edit Automation' : 'Create New Automation'}</DialogTitle>
            </DialogHeader>
            {formData && (
              <form onSubmit={handleSubmit} className="space-y-6 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Automation Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select value={formData.trigger_type} onValueChange={(v) => handleFormChange('trigger_type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRIGGER_TYPES.map(type => <SelectItem key={type} value={type}>{type.replace('_',' ').toUpperCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.trigger_type === 'keyword_match' && (
                  <div>
                    <Label htmlFor="trigger_keywords">Trigger Keywords</Label>
                    <Input 
                      id="trigger_keywords" 
                      value={formData.trigger_keywords.join(', ')} 
                      onChange={(e) => handleKeywordChange(e.target.value)}
                      placeholder="e.g. price, info, hours"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate keywords with a comma.</p>
                  </div>
                )}
                
                <div>
                  <Label>Message Sequence</Label>
                  <div className="space-y-4 mt-2 p-4 border rounded-lg bg-slate-50">
                    <AnimatePresence>
                    {formData.message_sequence.map((step, index) => (
                      <motion.div 
                        key={index}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 bg-white border rounded-md shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-slate-800">Step {index + 1}</h4>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeMessageStep(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <Label htmlFor={`delay_${index}`}>Delay (minutes)</Label>
                            <Input id={`delay_${index}`} type="number" value={step.delay_minutes} onChange={(e) => handleSequenceChange(index, 'delay_minutes', parseInt(e.target.value, 10))} />
                          </div>
                          <div className="md:col-span-2">
                             <Label htmlFor={`message_${index}`}>Message Text</Label>
                             <Textarea id={`message_${index}`} value={step.message_text} onChange={(e) => handleSequenceChange(index, 'message_text', e.target.value)} />
                             <p className="text-xs text-slate-500 mt-1">Use {'{name}'} for lead's name.</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                            <Switch id={`booking_link_${index}`} checked={step.has_booking_link} onCheckedChange={(c) => handleSequenceChange(index, 'has_booking_link', c)} />
                            <Label htmlFor={`booking_link_${index}`}>Include Appointment Booking Link</Label>
                        </div>
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    <Button type="button" variant="outline" onClick={addMessageStep}>
                      <Plus className="w-4 h-4 mr-2" /> Add Step
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={(c) => handleFormChange('is_active', c)} />
                    <Label htmlFor="is_active">Activate this Automation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="business_hours" checked={formData.business_hours_only} onCheckedChange={(c) => handleFormChange('business_hours_only', c)} />
                    <Label htmlFor="business_hours">Send During Business Hours Only</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                  <Button type="submit">Save Automation</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}