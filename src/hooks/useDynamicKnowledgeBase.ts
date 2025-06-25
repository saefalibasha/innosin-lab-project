
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeBaseEntry {
  id: string;
  brand: string;
  product_category: string;
  keywords: string[];
  response_template: string;
  confidence_threshold: number;
  source_document_id: string | null;
  priority: number;
  is_active: boolean;
}

interface PDFContent {
  id: string;
  content_type: string;
  title: string | null;
  content: string;
  keywords: string[] | null;
  confidence_score: number | null;
}

interface ProductSpecification {
  specification_name: string;
  specification_value: string;
  unit: string | null;
  category: string | null;
  is_key_feature: boolean;
}

export const useDynamicKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setKnowledgeBase(data || []);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const findBestResponse = async (userMessage: string): Promise<{ response: string; confidence: number; source?: string }> => {
    const lowerMessage = userMessage.toLowerCase();
    let bestMatch = { response: '', confidence: 0.3, source: '' };

    // Search through knowledge base entries
    for (const entry of knowledgeBase) {
      const matchCount = entry.keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        const confidence = Math.min(0.95, entry.confidence_threshold + (matchCount * 0.1));
        if (confidence > bestMatch.confidence) {
          let enhancedResponse = entry.response_template;

          // If there's a source document, try to get specific content
          if (entry.source_document_id) {
            const specificContent = await getSpecificContent(entry.source_document_id, lowerMessage);
            if (specificContent) {
              enhancedResponse += `\n\n${specificContent}`;
            }
          }

          bestMatch = { 
            response: enhancedResponse, 
            confidence,
            source: `${entry.brand} ${entry.product_category} catalog`
          };
        }
      }
    }

    // Enhanced fallback responses for product-focused queries
    if (bestMatch.confidence < 0.5) {
      if (lowerMessage.includes('specification') || lowerMessage.includes('spec')) {
        bestMatch = {
          response: 'I can provide detailed specifications for our laboratory equipment. Our catalogs include comprehensive technical data for all products. Which specific product or brand would you like specifications for? I have information on Broen-Lab, Oriental Giken, Hamilton Laboratory, and Innosin Lab products.',
          confidence: 0.7,
          source: 'Dynamic catalog system'
        };
      } else if (lowerMessage.includes('catalog') || lowerMessage.includes('products')) {
        bestMatch = {
          response: 'I have access to our complete product catalogs including Broen-Lab emergency equipment, Oriental Giken fume hoods, Hamilton Laboratory furniture, and Innosin Lab comprehensive solutions. What type of laboratory equipment are you looking for?',
          confidence: 0.75,
          source: 'Product catalog database'
        };
      } else if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
        bestMatch = {
          response: 'I can help you compare products from our catalogs. Our database includes detailed specifications that allow for comprehensive product comparisons. Which products would you like me to compare?',
          confidence: 0.8,
          source: 'Comparative analysis system'
        };
      }
    }

    return bestMatch;
  };

  const getSpecificContent = async (documentId: string, query: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('pdf_content')
        .select('*')
        .eq('document_id', documentId)
        .eq('is_active', true);

      if (error || !data) return null;

      // Find the most relevant content based on query
      const relevantContent = data.find(content => 
        content.keywords?.some(keyword => 
          query.includes(keyword.toLowerCase())
        ) || content.content.toLowerCase().includes(query)
      );

      if (relevantContent) {
        return `**${relevantContent.title || relevantContent.content_type}:**\n${relevantContent.content}`;
      }

      return null;
    } catch (error) {
      console.error('Error fetching specific content:', error);
      return null;
    }
  };

  const getProductSpecifications = async (productQuery: string): Promise<ProductSpecification[]> => {
    try {
      const { data, error } = await supabase
        .from('product_specifications')
        .select('*')
        .or(`specification_name.ilike.%${productQuery}%,specification_value.ilike.%${productQuery}%`)
        .eq('is_key_feature', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product specifications:', error);
      return [];
    }
  };

  const updateKnowledgeBase = async () => {
    await fetchKnowledgeBase();
  };

  return {
    knowledgeBase,
    loading,
    findBestResponse,
    getProductSpecifications,
    updateKnowledgeBase
  };
};
