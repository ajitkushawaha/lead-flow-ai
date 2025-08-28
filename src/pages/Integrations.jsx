import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Puzzle,
  MessageCircle,
  Facebook,
  Calendar,
  Zap,
  HelpCircle,
  Plus,
  Mail,
  Phone,
  Instagram,
  Slack,
  Webhook,
  Database,
  CreditCard,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

const integrations = {
  messaging: [
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Send and receive messages directly from leads via the WhatsApp Business API.",
      icon: MessageCircle,
      color: "green",
      status: "available",
      setup: "Connect your WhatsApp Business account to enable automated messaging flows."
    },
    {
      id: "sms",
      name: "SMS/Twilio",
      description: "Send SMS messages to leads when WhatsApp is not available.",
      icon: Phone,
      color: "blue",
      status: "available",
      setup: "Configure Twilio credentials to enable SMS messaging."
    },
    {
      id: "email",
      name: "Email Marketing",
      description: "Send follow-up emails and nurture sequences to your leads.",
      icon: Mail,
      color: "purple",
      status: "available", 
      setup: "Connect your email service provider (SendGrid, Mailgun, etc.)"
    }
  ],
  lead_capture: [
    {
      id: "meta_ads",
      name: "Facebook & Instagram Ads",
      description: "Automatically capture new leads from your Meta Lead Ads in real-time.",
      icon: Facebook,
      color: "blue",
      status: "available",
      setup: "Connect your Facebook Business account to sync lead ads data."
    },
    {
      id: "google_ads",
      name: "Google Ads",
      description: "Import leads from Google Ads Lead Form Extensions automatically.",
      icon: Zap,
      color: "red",
      status: "available",
      setup: "Connect your Google Ads account and configure lead form extensions."
    },
    {
      id: "instagram_dm",
      name: "Instagram DMs",
      description: "Capture leads from Instagram direct messages and comments.",
      icon: Instagram,
      color: "pink",
      status: "available",
      setup: "Connect your Instagram Business account for DM integration."
    }
  ],
  calendar: [
    {
      id: "google_calendar",
      name: "Google Calendar",
      description: "Two-way sync for appointments. Prevent double bookings and sync with your existing calendar.",
      icon: Calendar,
      color: "blue",
      status: "available",
      setup: "Connect your Google account to enable calendar synchronization."
    },
    {
      id: "outlook_calendar",
      name: "Outlook Calendar",
      description: "Sync appointments with Microsoft Outlook/Office 365 calendars.",
      icon: Calendar,
      color: "purple",
      status: "coming_soon",
      setup: "Microsoft Calendar integration coming in Q2 2025."
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Sync with your existing Calendly booking system.",
      icon: Clock,
      color: "amber",
      status: "coming_soon",
      setup: "Calendly integration coming soon."
    }
  ],
  crm: [
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Sync leads and contacts with HubSpot to keep your sales data unified.",
      icon: Database,
      color: "orange",
      status: "available",
      setup: "Connect your HubSpot account to sync contacts and deals."
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Push leads and sync data with Salesforce CRM.",
      icon: Zap,
      color: "blue",
      status: "coming_soon",
      setup: "Salesforce integration planned for enterprise customers."
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      description: "Sync leads and pipeline data with Pipedrive CRM.",
      icon: Database,
      color: "green",
      status: "coming_soon",
      setup: "Pipedrive integration coming in Q1 2025."
    }
  ],
  other: [
    {
      id: "slack",
      name: "Slack Notifications",
      description: "Get instant notifications in Slack when new leads arrive.",
      icon: Slack,
      color: "purple",
      status: "available",
      setup: "Install our Slack app and choose your notification channel."
    },
    {
      id: "webhooks",
      name: "Custom Webhooks",
      description: "Send lead data to any custom endpoint or third-party service.",
      icon: Webhook,
      color: "gray",
      status: "available",
      setup: "Configure webhook URLs for custom integrations."
    },
    {
      id: "stripe",
      name: "Stripe Payments",
      description: "Accept payments for services directly through booking links.",
      icon: CreditCard,
      color: "purple",
      status: "coming_soon",
      setup: "Payment processing integration coming soon."
    }
  ]
};

const IntegrationCard = ({ integration, onConnect }) => {
  const { name, description, icon: Icon, color, status, setup } = integration;
  
  const getStatusBadge = () => {
    switch(status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'available':
        return <Badge variant="outline">Available</Badge>;
      case 'coming_soon':
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <p className="text-xs text-slate-500 mb-4">{setup}</p>
        
        {status === 'available' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex="0">
                  <Button disabled className="w-full" onClick={() => onConnect(integration)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Please enable Backend Features in your project settings to activate integrations.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : status === 'coming_soon' ? (
          <Button disabled variant="outline" className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Manage
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function Integrations() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setShowConnectDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
              <p className="text-slate-600 mt-1">Connect your favorite tools to supercharge your workflow</p>
            </div>
          </div>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Request Integration
          </Button>
        </div>

        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <HelpCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Backend Features Required:</strong> To activate these integrations, please enable Backend Features in your Project Settings. This will unlock secure API connections and webhook capabilities.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="lead_capture">Lead Capture</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {Object.entries(integrations).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 capitalize">
                  {category.replace('_', ' ')} ({items.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(integration => (
                    <IntegrationCard 
                      key={integration.id} 
                      integration={integration} 
                      onConnect={handleConnect}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {Object.entries(integrations).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(integration => (
                  <IntegrationCard 
                    key={integration.id} 
                    integration={integration} 
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Connection Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedIntegration?.icon && <selectedIntegration.icon className="w-5 h-5" />}
                Connect {selectedIntegration?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Backend features must be enabled in your project settings before connecting external services.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Enable Backend Features in Project Settings</li>
                  <li>Configure API credentials securely</li>
                  <li>Set up webhooks and data flows</li>
                  <li>Test the connection</li>
                </ol>
              </div>

              {selectedIntegration?.id === 'google_calendar' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Google Calendar Benefits:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    <li>Two-way appointment synchronization</li>
                    <li>Prevent double-booking conflicts</li>
                    <li>Access existing calendar events</li>
                    <li>Automatic meeting reminders</li>
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Close
              </Button>
              <Button disabled>
                Configure Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}