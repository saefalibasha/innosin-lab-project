
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

const GoogleMapsLocation = () => {
  // Innosin Lab Singapore coordinates (example - replace with actual address)
  const companyAddress = "123 Innovation Drive, Singapore Science Park, Singapore 117528";
  const latitude = "1.2966";
  const longitude = "103.7764";
  
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7956945935934!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTcnNDgiTiAxMDPCsDQ2JzM1IkU!5e0!3m2!1sen!2ssg!4v1000000000000!5m2!1sen!2ssg`;
  
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companyAddress)}`;

  const businessHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM', status: 'Open' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM', status: 'Limited' },
    { day: 'Sunday', hours: 'Closed', status: 'Closed' }
  ];

  const contactDetails = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Address',
      value: companyAddress,
      action: () => window.open(directionsUrl, '_blank')
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Phone',
      value: '+65 6123 4567',
      action: () => window.open('tel:+6561234567')
    },
    {
      icon: <Navigation className="w-5 h-5" />,
      label: 'Get Directions',
      value: 'Open in Google Maps',
      action: () => window.open(directionsUrl, '_blank')
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-96">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Innosin Lab Location"
            />
            
            {/* Overlay with company info */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IL</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Innosin Lab Pte. Ltd.</h4>
                  <Badge variant="secondary" className="text-xs">
                    Laboratory Solutions
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Professional laboratory equipment and furniture solutions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Visit Our Facility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={detail.action}
              >
                <div className="text-blue-600 mt-1">
                  {detail.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{detail.label}</h4>
                  <p className="text-gray-600 text-sm">{detail.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Business Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-900">{schedule.day}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm">{schedule.hours}</span>
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
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For project consultations and site visits, 
                please schedule an appointment in advance via phone or email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleMapsLocation;
