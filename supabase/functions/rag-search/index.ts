import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('RAG search request:', query);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI embedding error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar documents using vector similarity
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 10
      }
    );

    if (searchError) {
      console.error('Vector search error:', searchError);
      // Fallback to text search if vector search fails
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('school_info')
        .select('*')
        .textSearch('content', query)
        .limit(10);

      if (fallbackError) {
        throw new Error('Search failed');
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          results: fallbackResults || [],
          method: 'text_search'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we have Cohere API key, use it for reranking
    let finalResults = searchResults || [];

    if (cohereApiKey && finalResults.length > 0) {
      try {
        const documents = finalResults.map(result => result.content);
        
        const rerankResponse = await fetch('https://api.cohere.ai/v1/rerank', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cohereApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'rerank-multilingual-v2.0',
            query: query,
            documents: documents,
            top_k: 5
          }),
        });

        if (rerankResponse.ok) {
          const rerankData = await rerankResponse.json();
          const rerankedResults = rerankData.results.map((result: any) => ({
            ...finalResults[result.index],
            relevance_score: result.relevance_score
          }));
          finalResults = rerankedResults;
        }
      } catch (rerankError) {
        console.error('Reranking failed, using original results:', rerankError);
      }
    }

    console.log('Search completed, found:', finalResults.length, 'results');

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: finalResults,
        method: cohereApiKey ? 'vector_search_with_rerank' : 'vector_search'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rag-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to create the vector similarity search function
// This should be created in your Supabase database
const createMatchDocumentsFunction = `
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  category text,
  tags text[],
  similarity float
)
language sql stable
as $$
  select
    school_info.id,
    school_info.content,
    school_info.category,
    school_info.tags,
    1 - (school_info.embedding <=> query_embedding) as similarity
  from school_info
  where 1 - (school_info.embedding <=> query_embedding) > match_threshold
  order by school_info.embedding <=> query_embedding
  limit match_count;
$$;
`;