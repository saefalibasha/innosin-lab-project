
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Award, MapPin, Users } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  type: 'milestone' | 'certification' | 'expansion' | 'innovation';
  icon: React.ReactNode;
}

const CompanyTimeline = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const events: TimelineEvent[] = [
    {
      year: '2010',
      title: 'Company Founded',
      description: 'Innosin Lab was established with a vision to revolutionize laboratory furniture and safety equipment.',
      type: 'milestone',
      icon: <Users className="w-5 h-5" />
    },
    {
      year: '2012',
      title: 'ISO 9001 Certification',
      description: 'Achieved ISO 9001:2008 certification for quality management systems.',
      type: 'certification',
      icon: <Award className="w-5 h-5" />
    },
    {
      year: '2015',
      title: 'First International Project',
      description: 'Successfully completed our first major international laboratory installation in Southeast Asia.',
      type: 'expansion',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      year: '2018',
      title: 'Smart Lab Technology',
      description: 'Introduced IoT-enabled laboratory equipment with remote monitoring capabilities.',
      type: 'innovation',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      year: '2020',
      title: '3D Floor Planning',
      description: 'Launched our revolutionary 3D floor planning tool for virtual lab design.',
      type: 'innovation',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      year: '2023',
      title: 'Sustainability Award',
      description: 'Received the Green Laboratory Design Award for eco-friendly manufacturing processes.',
      type: 'certification',
      icon: <Award className="w-5 h-5" />
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-500';
      case 'certification': return 'bg-green-500';
      case 'expansion': return 'bg-purple-500';
      case 'innovation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
        <p className="text-xl text-gray-600">Milestones that shaped our company</p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>

        {/* Timeline Events */}
        <div className="space-y-12">
          {events.map((event, index) => (
            <div key={event.year} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-2">
                      <Badge className={`${getTypeColor(event.type)} text-white mr-2`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      <span className="text-2xl font-bold text-gray-900">{event.year}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Node */}
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-full ${getTypeColor(event.type)} flex items-center justify-center text-white shadow-lg`}>
                  {event.icon}
                </div>
              </div>

              <div className="w-5/12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <Card className="max-w-lg mx-4">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Badge className={`${getTypeColor(selectedEvent.type)} text-white mr-2`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Badge>
                <span className="text-2xl font-bold text-gray-900">{selectedEvent.year}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{selectedEvent.title}</h3>
              <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
              <Button onClick={() => setSelectedEvent(null)} className="bg-black hover:bg-gray-800">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompanyTimeline;
