
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Download, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingData {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  lastUpdated: Date;
}

const ChatbotTraining = () => {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: 'general'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    'general',
    'products',
    'technical-support',
    'sales',
    'pricing',
    'installation',
    'maintenance'
  ];

  const handleAddEntry = () => {
    if (!newEntry.question || !newEntry.answer) {
      toast.error('Please fill in both question and answer');
      return;
    }

    const entry: TrainingData = {
      id: Date.now().toString(),
      ...newEntry,
      confidence: 1.0,
      lastUpdated: new Date()
    };

    setTrainingData([...trainingData, entry]);
    setNewEntry({ question: '', answer: '', category: 'general' });
    toast.success('Training entry added successfully');
  };

  const handleDeleteEntry = (id: string) => {
    setTrainingData(trainingData.filter(entry => entry.id !== id));
    toast.success('Training entry deleted');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(trainingData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'chatbot-training-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Training data exported');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setTrainingData([...trainingData, ...imported]);
          toast.success(`Imported ${imported.length} training entries`);
        }
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chatbot Training Center</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <label htmlFor="import-file">
            <Button variant="outline" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList>
          <TabsTrigger value="manage">Manage Training Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Bot Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Add New Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Training Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Question/Intent</label>
                  <Input
                    value={newEntry.question}
                    onChange={(e) => setNewEntry({...newEntry, question: e.target.value})}
                    placeholder="What question might users ask?"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Response</label>
                <Textarea
                  value={newEntry.answer}
                  onChange={(e) => setNewEntry({...newEntry, answer: e.target.value})}
                  placeholder="How should the bot respond?"
                  rows={4}
                />
              </div>
              <Button onClick={handleAddEntry} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Training Entry
              </Button>
            </CardContent>
          </Card>

          {/* Training Data List */}
          <Card>
            <CardHeader>
              <CardTitle>Training Data ({trainingData.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{entry.category}</Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(entry.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>Question:</strong> {entry.question}
                      </div>
                      <div>
                        <strong>Answer:</strong> {entry.answer}
                      </div>
                      <div className="text-sm text-gray-500">
                        Confidence: {(entry.confidence * 100).toFixed(1)}% | 
                        Last updated: {entry.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {trainingData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No training data yet. Add some entries to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Training Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Entries</h3>
                  <p className="text-2xl font-bold text-blue-600">{trainingData.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Categories</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(trainingData.map(d => d.category)).size}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Avg Confidence</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {trainingData.length > 0 
                      ? (trainingData.reduce((sum, d) => sum + d.confidence, 0) / trainingData.length * 100).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">AI Service</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="openai">OpenAI GPT-4</option>
                  <option value="claude">Claude</option>
                  <option value="custom">Custom Model</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Response Confidence Threshold</label>
                <Input type="number" min="0" max="1" step="0.1" defaultValue="0.7" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fallback Message</label>
                <Textarea 
                  defaultValue="I'm not sure about that. Let me connect you with a human agent who can help you better."
                  rows={3}
                />
              </div>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotTraining;
