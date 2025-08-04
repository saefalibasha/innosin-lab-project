import { supabase } from '@/integrations/supabase/client';

export const debugSupabaseProducts = async () => {
  console.log('🔍 Debugging Supabase Products Connection...');
  
  try {
    // Test 1: Basic connection test
    console.log('\n=== Test 1: Basic Supabase Connection ===');
    const { data: healthCheck, error: healthError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError);
      return { success: false, error: healthError };
    }
    
    console.log('✅ Supabase connection successful');

    // Test 2: Count all products
    console.log('\n=== Test 2: Total Products Count ===');
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting products:', countError);
    } else {
      console.log(`📊 Total products in database: ${totalCount}`);
    }

    // Test 3: Sample products without filters
    console.log('\n=== Test 3: Sample Products (No Filters) ===');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, category, is_active, is_series_parent, created_at')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error fetching sample products:', sampleError);
    } else {
      console.log('📋 Sample products:', sampleProducts);
    }

    // Test 4: Check boolean field distributions
    console.log('\n=== Test 4: Boolean Field Analysis ===');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('is_active, is_series_parent');
    
    if (allError) {
      console.error('❌ Error fetching boolean fields:', allError);
    } else {
      const activeTrue = allProducts?.filter(p => p.is_active === true).length || 0;
      const activeFalse = allProducts?.filter(p => p.is_active === false).length || 0;
      const activeNull = allProducts?.filter(p => p.is_active === null).length || 0;
      
      const seriesTrue = allProducts?.filter(p => p.is_series_parent === true).length || 0;
      const seriesFalse = allProducts?.filter(p => p.is_series_parent === false).length || 0;
      const seriesNull = allProducts?.filter(p => p.is_series_parent === null).length || 0;
      
      console.log('📈 is_active distribution:', { true: activeTrue, false: activeFalse, null: activeNull });
      console.log('📈 is_series_parent distribution:', { true: seriesTrue, false: seriesFalse, null: seriesNull });
    }

    // Test 5: Current restrictive query
    console.log('\n=== Test 5: Current Restrictive Query ===');
    const { data: restrictiveProducts, error: restrictiveError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_series_parent', true);
    
    if (restrictiveError) {
      console.error('❌ Error with restrictive query:', restrictiveError);
    } else {
      console.log(`🎯 Products matching current filters: ${restrictiveProducts?.length || 0}`);
      if (restrictiveProducts && restrictiveProducts.length > 0) {
        console.log('Sample matched product:', restrictiveProducts[0]);
      }
    }

    // Test 6: Less restrictive queries
    console.log('\n=== Test 6: Less Restrictive Queries ===');
    
    // Only is_active = true
    const { data: activeOnly, error: activeOnlyError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('is_active', true);
    
    if (!activeOnlyError) {
      console.log(`🟡 Products with is_active=true: ${activeOnly?.length || 0}`);
    }

    // Only is_series_parent = true
    const { data: seriesOnly, error: seriesOnlyError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('is_series_parent', true);
    
    if (!seriesOnlyError) {
      console.log(`🟡 Products with is_series_parent=true: ${seriesOnly?.length || 0}`);
    }

    // No filters at all
    const { data: noFilters, error: noFiltersError } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(10);
    
    if (!noFiltersError) {
      console.log(`🟢 Products with no filters (limit 10): ${noFilters?.length || 0}`);
    }

    console.log('\n✅ Debug analysis complete');
    
    return {
      success: true,
      totalCount,
      sampleProducts,
      restrictiveCount: restrictiveProducts?.length || 0,
      activeOnlyCount: activeOnly?.length || 0,
      seriesOnlyCount: seriesOnly?.length || 0,
      noFiltersCount: noFilters?.length || 0
    };

  } catch (error) {
    console.error('💥 Debug analysis failed:', error);
    return { success: false, error };
  }
};

export const testAlternativeQueries = async () => {
  console.log('\n🧪 Testing Alternative Query Strategies...');
  
  const strategies = [
    {
      name: 'Strategy 1: No filters',
      query: () => supabase.from('products').select('*').limit(10)
    },
    {
      name: 'Strategy 2: Only is_active=true',
      query: () => supabase.from('products').select('*').eq('is_active', true).limit(10)
    },
    {
      name: 'Strategy 3: is_active=true OR is_active IS NULL',
      query: () => supabase.from('products').select('*').or('is_active.eq.true,is_active.is.null').limit(10)
    },
    {
      name: 'Strategy 4: Only is_series_parent=true',
      query: () => supabase.from('products').select('*').eq('is_series_parent', true).limit(10)
    },
    {
      name: 'Strategy 5: is_series_parent=true OR is_series_parent IS NULL',
      query: () => supabase.from('products').select('*').or('is_series_parent.eq.true,is_series_parent.is.null').limit(10)
    }
  ];

  const results = [];
  
  for (const strategy of strategies) {
    try {
      const { data, error } = await strategy.query();
      if (error) {
        console.log(`❌ ${strategy.name}: Error - ${error.message}`);
        results.push({ ...strategy, success: false, error, count: 0 });
      } else {
        console.log(`✅ ${strategy.name}: ${data?.length || 0} products found`);
        results.push({ ...strategy, success: true, data, count: data?.length || 0 });
      }
    } catch (error) {
      console.log(`💥 ${strategy.name}: Exception - ${error}`);
      results.push({ ...strategy, success: false, error, count: 0 });
    }
  }
  
  return results;
};