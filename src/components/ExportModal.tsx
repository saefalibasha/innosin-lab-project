
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Send, Image, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface ExportModalProps {
  children: React.ReactNode;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  roomPoints: any[];
  placedProducts: any[];
  rooms?: any[];
  projectName?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  children, 
  canvasRef, 
  roomPoints, 
  placedProducts,
  rooms = [],
  projectName = 'Floor Plan'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'jpg' | 'png' | 'pdf'>('jpg');
  const [exportQuality, setExportQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingToHubSpot, setIsSendingToHubSpot] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  const { createTicket, createContact } = useHubSpotIntegration();

  // Enhanced canvas export with high quality
  const exportCanvasAsImage = async (format: 'jpg' | 'png' = 'jpg', quality: number = 0.9): Promise<Blob | null> => {
    if (!canvasRef?.current) {
      toast.error('Canvas not available for export');
      return null;
    }

    try {
      const canvas = canvasRef.current;
      
      // Create high-resolution version
      const exportCanvas = document.createElement('canvas');
      const scaleFactor = 2; // 2x resolution for better quality
      exportCanvas.width = canvas.width * scaleFactor;
      exportCanvas.height = canvas.height * scaleFactor;
      
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;
      
      // Scale and draw original canvas
      ctx.scale(scaleFactor, scaleFactor);
      ctx.drawImage(canvas, 0, 0);
      
      return new Promise((resolve) => {
        exportCanvas.toBlob(
          (blob) => resolve(blob),
          format === 'jpg' ? 'image/jpeg' : 'image/png',
          quality
        );
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export canvas');
      return null;
    }
  };

  const handleDirectDownload = async () => {
    setIsExporting(true);
    
    try {
      const blob = await exportCanvasAsImage(exportFormat, exportQuality);
      if (!blob) return;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}.${exportFormat}`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success(`Floor plan downloaded as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendToHubSpot = async () => {
    if (!userEmail || !userName) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsSendingToHubSpot(true);

    try {
      // Export canvas as JPG
      const imageBlob = await exportCanvasAsImage('jpg', 0.9);
      if (!imageBlob) return;

      // Create contact first
      const sessionId = `floor_planner_${Date.now()}`;
      
      const contactResult = await createContact({
        sessionId,
        email: userEmail,
        name: userName
      });

      // Prepare floor plan metadata
      const metadata = {
        projectName,
        totalProducts: placedProducts.length,
        totalRooms: rooms.length,
        exportDate: new Date().toISOString(),
        canvasDimensions: canvasRef?.current ? {
          width: canvasRef.current.width,
          height: canvasRef.current.height
        } : null
      };

      // Create ticket with attachment info
      const ticketContent = `
Floor Plan Inquiry from ${userName}

${userMessage ? `Message: ${userMessage}\n` : ''}

Floor Plan Details:
- Project: ${projectName}
- Products: ${placedProducts.length}
- Rooms: ${rooms.length}
- Export Date: ${new Date().toLocaleString()}

Note: Floor plan image attachment included.
      `.trim();

      await createTicket({
        sessionId,
        subject: `Floor Plan Inquiry - ${projectName}`,
        content: ticketContent,
        contactId: contactResult?.contactId,
        priority: 'MEDIUM'
      });

      toast.success('Floor plan sent to our team successfully!');
      setIsOpen(false);
      
      // Reset form
      setUserMessage('');
      setUserEmail('');
      setUserName('');
      
    } catch (error) {
      console.error('HubSpot error:', error);
      toast.error('Failed to send to our team. Please try again.');
    } finally {
      setIsSendingToHubSpot(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Export Floor Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Floor Plan Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{projectName}</span>
              <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>Products: {placedProducts.length}</div>
              <div>Rooms: {rooms.length}</div>
              <div>Points: {roomPoints.length}</div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <div className="flex gap-2 mt-1">
                {(['jpg', 'png'] as const).map(format => (
                  <Button
                    key={format}
                    variant={exportFormat === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Quality: {Math.round(exportQuality * 100)}%</Label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportQuality}
                onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Direct Download */}
            <Button
              onClick={handleDirectDownload}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download {exportFormat.toUpperCase()}
            </Button>

            {/* Send to HubSpot */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send to Our Team
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="userName">Your Name *</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Tell us about your project requirements..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSendToHubSpot}
                disabled={isSendingToHubSpot || !userEmail || !userName}
                className="w-full"
              >
                {isSendingToHubSpot ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Inquiry with Floor Plan
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
