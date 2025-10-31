import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabaseUrl: string,
  supabaseKey: string,
  config: RateLimitConfig = defaultConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get recent requests from this user for this endpoint
    const { data: recentRequests, error } = await supabase
      .from('rate_limits')
      .select('created_at')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('created_at', new Date(windowStart).toISOString())
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('Rate limit check error:', error);
      // If table doesn't exist or error, allow the request (fail open)
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
    }

    const requestCount = recentRequests?.length || 0;

    if (requestCount >= config.maxRequests) {
      const oldestRequest = recentRequests?.[requestCount - 1];
      const resetAt = oldestRequest 
        ? new Date(oldestRequest.created_at).getTime() + config.windowMs
        : now + config.windowMs;
      
      return { allowed: false, remaining: 0, resetAt };
    }

    // Log this request
    await supabase.from('rate_limits').insert({
      user_id: userId,
      endpoint,
      created_at: new Date(now).toISOString()
    });

    return {
      allowed: true,
      remaining: config.maxRequests - requestCount - 1,
      resetAt: now + config.windowMs
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open - allow request if rate limiter fails
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }
}
