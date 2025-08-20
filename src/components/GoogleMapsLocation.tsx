import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone, Navigation, Mail } from 'lucide-react';

// Location component without external map dependencies
const GoogleMapsLocation = () => {
  const offices = [
    {
      id: 'singapore',
      name: 'SINGAPORE',
      address: '510 Bedok North Street 3, Singapore 460510',
      coordinates: { lat: '1.3321740824098278', lng: '103.930623716398' },
      type: 'Branch Office'
    },
    {
      id: 'johor',
      name: 'JOHOR BAHRU',
      address: 'Lot 48, 18km, Jalan Johor Bahru - Kota Tinggi, 81800 Ulu Tiram, Johor, Malaysia.',
      coordinates: { lat: '1.5720704381300796', lng: '103.82033832084565' },
      type: 'Headquarters'
    },
    {
      id: 'kl',
      name: 'KUALA LUMPUR',
      address: 'B-05-16, kompleks Perindustrian EMHUB, Persiaran Surian, Seksyen 3, Taman Sains Selangor, Petaling Jaya, Malaysia, 47810, Selangor',
      coordinates: { lat: '3.1590964699560318', lng: '101.57309386963026' },
      type: 'Branch Office'
    }
  ];

  const [selectedOffice, setSelectedOffice] = useState(offices[1]); // Default to HQ

  const getDirectionsUrl = (address: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const businessHours = [
    { day: 'Monday - Friday', hours: '08:15 AM - 05:15 PM' },
    { day: 'Saturday', hours: '08:15 AM - 12:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const contactDetails = [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Address',
      value: selectedOffice.address,
      action: () => window.open(getDirectionsUrl(selectedOffice.address), '_blank')
    },
    {
      icon: <Phone className="w-4 h-4" />,
      label: 'Phone',
      value: '(+607) 863 3535',
      action: () => window.open('tel:+6078633535')
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'Sales Enquiry',
      value: 'enquiry@innosinlab.com',
      action: () => window.open('mailto:enquiry@innosinlab.com')
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'General Info',
      value: 'info@innosinlab.com',
      action: () => window.open('mailto:info@innosinlab.com')
    },
    {
      icon: <Navigation className="w-4 h-4" />,
      label: 'Get Directions',
      value: 'Open in Google Maps',
      action: () => window.open(getDirectionsUrl(selectedOffice.address), '_blank')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Office Selection Buttons */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in animate-delay-200">
          {offices.map((office, index) => (
            <Button
              key={office.id}
              onClick={() => setSelectedOffice(office)}
              variant={selectedOffice.id === office.id ? "default" : "outline"}
              className={`px-6 py-3 h-auto flex flex-col items-center space-y-1 animate-scale-in ${
                selectedOffice.id === office.id 
                  ? "bg-sea hover:bg-sea-dark" 
                  : "hover:bg-sea/10"
              }`}
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <span className="font-semibold text-sm">{office.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Map */}
        <div className="lg:col-span-7 animate-fade-in-left animate-delay-500">
          <Card className="overflow-hidden glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative h-[700px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                
                {/* Embedded OpenStreetMap */}
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selectedOffice.coordinates.lng) - 0.01},${parseFloat(selectedOffice.coordinates.lat) - 0.01},${parseFloat(selectedOffice.coordinates.lng) + 0.01},${parseFloat(selectedOffice.coordinates.lat) + 0.01}&layer=mapnik&marker=${selectedOffice.coordinates.lat},${selectedOffice.coordinates.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title={`${selectedOffice.name} Location Map`}
                  className="w-full h-full"
                />

                {/* Coordinates Display */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-white/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Coordinates</div>
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      Lat: {parseFloat(selectedOffice.coordinates.lat).toFixed(6)}
                    </div>
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      Lng: {parseFloat(selectedOffice.coordinates.lng).toFixed(6)}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps/?q=${selectedOffice.coordinates.lat},${selectedOffice.coordinates.lng}`, '_blank')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 h-auto"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Google Maps
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${selectedOffice.coordinates.lat}&mlon=${selectedOffice.coordinates.lng}&zoom=15`, '_blank')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 h-auto"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Full Map
                    </Button>
                  </div>
                </div>
                
                {/* Company Info Overlay */}
                <div className="absolute bottom-4 left-4 glass-card p-4 rounded-lg shadow-xl max-w-sm animate-slide-up border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-sea rounded-sm flex items-center justify-center">
                      <span className="text-white font-bold text-sm">IL</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Innosin Lab Pte. Ltd.</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {selectedOffice.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Professional laboratory equipment and furniture solutions for modern research facilities.
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      📍 Currently viewing: <span className="font-semibold">{selectedOffice.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-3 space-y-4 animate-fade-in-right animate-delay-700">
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg font-serif">
                <MapPin className="w-5 h-5 text-sea" />
                <span>{selectedOffice.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {contactDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 rounded-lg hover:bg-sea/10 cursor-pointer transition-colors animate-fade-in"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                  onClick={detail.action}
                >
                  <div className="text-sea mt-0.5">
                    {detail.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">{detail.label}</h4>
                    <p className="text-muted-foreground text-xs break-words">{detail.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg font-serif">
                <Clock className="w-5 h-5 text-sea" />
                <span>Business Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {businessHours.map((schedule, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-1 animate-fade-in" 
                    style={{ animationDelay: `${1200 + index * 100}ms` }}
                  >
                    <span className="font-medium text-foreground text-sm w-32">{schedule.day}</span>
                    <span className="text-muted-foreground text-xs text-right">{schedule.hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-sea/10 rounded-lg animate-bounce-in animate-delay-1000">
                <p className="text-xs text-sea-dark">
                  <strong>Note:</strong> For project consultations and site visits, 
                  please schedule an appointment in advance via phone or email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsLocation;