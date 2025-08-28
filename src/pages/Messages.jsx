
import React, { useState, useEffect, useRef } from "react";
import { Lead } from "@/api/entities";
import { SMSSettings } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { sendSMS } from "@/api/functions";
import { sendWhatsAppMessage } from "@/api/functions"; // Added import for WhatsApp function
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send,
  User,
  Phone,
  Mail,
  MoreVertical,
  Paperclip,
  Smile,
  Search,
  MessageSquare,
  MessageCircle,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function Messages() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("auto");
  const [smsSettings, setSmsSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadLeads();
    loadSMSSettings();
  }, []);

  useEffect(() => {
    if (leads.length > 0 && !selectedLead) {
      setSelectedLead(leads[0]);
    }
  }, [leads, selectedLead]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLead?.conversation_history]);

  const loadLeads = async () => {
    try {
      const leadList = await Lead.list('-updated_date');
      setLeads(leadList);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setLoading(false);
  };

  const loadSMSSettings = async () => {
    try {
      const settings = await SMSSettings.list();
      setSmsSettings(settings[0] || null);
    } catch (error) {
      console.error("Error loading SMS settings:", error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedLead) return;

    setSending(true);
    const channel = selectedChannel === "auto" 
      ? (selectedLead.whatsapp_available ? "whatsapp" : "sms")
      : selectedChannel;

    // Create a mutable copy of the new message to potentially update its properties
    const newMessage = {
      sender: "system",
      message: message,
      channel: channel,
      timestamp: new Date().toISOString(),
      delivery_status: "sent" // Initial status
    };
    
    try {
      if (channel === 'whatsapp') {
        // Send WhatsApp message
        const { data } = await sendWhatsAppMessage({
          to: selectedLead.phone,
          message: message,
          clientId: selectedLead.client_id || "demo-client-1"
        });
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to send WhatsApp message');
        }
        
        // Update message with WhatsApp message ID and assumed initial delivery status
        newMessage.message_id = data.messageId;
        newMessage.delivery_status = "delivered"; // Assuming it's delivered upon successful API call for now
        
      } else if (channel === 'sms') {
        // Use existing SMS function
        await sendSMS({
          to: selectedLead.phone,
          body: message,
          clientId: selectedLead.client_id || "demo-client-1"
        });
      } else {
        // Email fallback
        await SendEmail({
          to: selectedLead.email || "demo@example.com",
          subject: `Email message from LeadMaster Pro`,
          body: `Channel: ${channel}\nMessage: ${message}`
        });
      }

      // After successful sending, update the lead's conversation history
      // Use the potentially modified newMessage
      const newConversationHistory = [...(selectedLead.conversation_history || []), newMessage];

      await Lead.update(selectedLead.id, { 
        conversation_history: newConversationHistory,
        last_message_sent: new Date().toISOString()
      });

      const updatedLead = { ...selectedLead, conversation_history: newConversationHistory };
      setSelectedLead(updatedLead);
      setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(`Failed to send message: ${error.response?.data?.error || error.message}`);
    }
    setSending(false);
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'whatsapp': return <MessageCircle className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  const getDeliveryStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'read': return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === "all") return true;
    if (activeTab === "whatsapp") return lead.preferred_channel === "whatsapp" || lead.whatsapp_available;
    if (activeTab === "sms") return lead.preferred_channel === "sms" || !lead.whatsapp_available;
    return true;
  });

  const ConversationItem = ({ lead, isSelected }) => (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-slate-200' : 'hover:bg-slate-100'
      }`}
      onClick={() => setSelectedLead(lead)}
    >
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${lead.name}`} />
        <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-slate-900">{lead.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={lead.whatsapp_available ? "success" : "secondary"} className="text-xs">
                {getChannelIcon(lead.preferred_channel || (lead.whatsapp_available ? 'whatsapp' : 'sms'))}
                <span className="ml-1">{lead.whatsapp_available ? 'WhatsApp' : 'SMS'}</span>
              </Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {lead.updated_date ? formatDistanceToNow(new Date(lead.updated_date), { addSuffix: true }) : ''}
          </p>
        </div>
        <p className="text-sm text-slate-600 truncate mt-1">
          {lead.conversation_history?.slice(-1)[0]?.message || 'No messages yet'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Left Panel: Conversation List */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-900">Messages</h2>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xs">WhatsApp</TabsTrigger>
              <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search conversations..." className="pl-10"/>
          </div>
        </div>

        {!smsSettings && (
          <div className="p-3 mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span>SMS not configured</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredLeads.map(lead => <ConversationItem key={lead.id} lead={lead} isSelected={selectedLead?.id === lead.id} />)}
        </div>
      </div>

      {/* Right Panel: Chat Window */}
      {selectedLead ? (
        <div className="w-2/3 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedLead.name}`} />
                <AvatarFallback>{selectedLead.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-900">{selectedLead.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">{selectedLead.phone}</p>
                  <Badge variant={selectedLead.whatsapp_available ? "success" : "secondary"} className="text-xs">
                    {getChannelIcon(selectedLead.preferred_channel || (selectedLead.whatsapp_available ? 'whatsapp' : 'sms'))}
                    <span className="ml-1">{selectedLead.whatsapp_available ? 'WhatsApp' : 'SMS Only'}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {selectedLead.conversation_history?.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.sender === 'system' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender !== 'system' && (
                     <Avatar size="sm">
                       <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedLead.name}`} />
                       <AvatarFallback>{selectedLead.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                  )}
                  <div className={`max-w-md p-3 rounded-xl ${
                    msg.sender === 'system' 
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.channel && getChannelIcon(msg.channel)}
                      <span className="text-xs opacity-70 uppercase">{msg.channel}</span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">{format(new Date(msg.timestamp), 'p')}</p>
                      {msg.sender === 'system' && msg.delivery_status && (
                        <div className="flex items-center gap-1">
                          {getDeliveryStatusIcon(msg.delivery_status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              {!smsSettings && selectedChannel === 'sms' && (
                <Badge variant="destructive" className="text-xs">SMS Not Configured</Badge>
              )}
            </div>
            <div className="relative">
              <Input 
                placeholder="Type a message..." 
                className="pr-24"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={sending || (!smsSettings && selectedChannel === 'sms')}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-2/3 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700">Select a conversation</h3>
            <p className="text-slate-500">Choose a lead from the list to view messages.</p>
          </div>
        </div>
      )}
    </div>
  );
}
