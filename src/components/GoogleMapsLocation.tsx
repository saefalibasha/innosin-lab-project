
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone, Navigation, Mail } from 'lucide-react';

const GoogleMapsLocation = () => {
  const offices = [
    {
      id: 'singapore',
      name: 'Singapore Office',
      address: '1 Raffles Place, #20-61 One Raffles Place, Singapore 048616',
      coordinates: { lat: '1.284', lng: '103.851' },
      type: 'Branch Office'
    },
    {
      id: 'johor',
      name: 'Johor Bahru HQ',
      address: 'No. 48, Jalan Harmonium 23/13, Taman Desa Tebrau, 81100 Johor Bahru, Johor, Malaysia',
      coordinates: { lat: '1.558', lng: '103.806' },
      type: 'Headquarters'
    },
    {
      id: 'kl',
      name: 'Kuala Lumpur Office',
      address: 'Level 10, Menara Landmark, No. 12, Jalan Ngee Heng, 80000 Johor Bahru, Johor, Malaysia',
      coordinates: { lat: '3.139', lng: '101.687' },
      type: 'Branch Office'
    }
  ];

  const [selectedOffice, setSelectedOffice] = useState(offices[1]); // Default to HQ

  const getMapEmbedUrl = (office: typeof offices[0]) => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7956945935934!2d${office.coordinates.lng}!3d${office.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${office.coordinates.lat}N%20${office.coordinates.lng}E!5e0!3m2!1sen!2ssg!4v1000000000000!5m2!1sen!2ssg`;
  };

  const getDirectionsUrl = (address: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const businessHours = [
    { day: 'Monday - Friday', hours: '08:15 AM - 05:15 PM', status: 'Open' },
    { day: 'Saturday', hours: '08:15 AM - 12:00 PM', status: 'Limited' },
    { day: 'Sunday', hours: 'Closed', status: 'Closed' }
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
        <h2 className="text-2xl font-serif font-bold text-center animate-fade-in">Our Office Locations</h2>
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
              style={{animationDelay: `${300 + index * 100}ms`}}
            >
              <span className="font-semibold text-sm">{office.name}</span>
              {office.type === 'Headquarters' && (
                <Badge variant="secondary" className="text-xs">HQ</Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Map - Takes 7 columns on large screens */}
        <div className="lg:col-span-7 animate-fade-in-left animate-delay-500">
          <Card className="overflow-hidden glass-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative h-[500px]">
                <iframe
                  src={getMapEmbedUrl(selectedOffice)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${selectedOffice.name} Location`}
                />
                
                {/* Overlay with company info */}
                <div className="absolute bottom-4 left-4 glass-card p-3 rounded-lg shadow-lg max-w-xs animate-slide-up">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-sea rounded-sm flex items-center justify-center">
                      <span className="text-white font-bold text-xs">IL</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Innosin Lab Pte. Ltd.</h4>
                      <Badge variant="secondary" className="text-xs">
                        {selectedOffice.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Professional laboratory equipment and furniture solutions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Details - Takes 3 columns on large screens */}
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
                  style={{animationDelay: `${800 + index * 100}ms`}}
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
                  <div key={index} className="flex justify-between items-center py-1 animate-fade-in" style={{animationDelay: `${1200 + index * 100}ms`}}>
                    <span className="font-medium text-foreground text-sm">{schedule.day}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground text-xs">{schedule.hours}</span>
                      <Badge 
                        variant={schedule.status === 'Open' ? 'default' : 
                                schedule.status === 'Limited' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {schedule.status}
                      </Badge>
                    </div>
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
