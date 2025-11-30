import Anthropic from '@anthropic-ai/sdk';

// Simple in-memory rate limiter (5 requests per minute per IP)
const rateLimiter = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000; // 60 seconds

/**
 * Rate limiting middleware
 * Allows 5 requests per minute per IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimiter.get(ip) || [];

  // Remove expired requests (older than 1 minute)
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_WINDOW);

  // Check if user has exceeded rate limit
  if (validRequests.length >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: validRequests[0] + RATE_WINDOW
    };
  }

  // Add current request
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);

  return {
    allowed: true,
    remaining: RATE_LIMIT - validRequests.length,
    resetTime: validRequests[0] + RATE_WINDOW
  };
}

/**
 * Helper function to extract and parse JSON from Claude's response
 */
function extractJSON(text) {
  // Remove markdown code fences
  let cleaned = text.trim()
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Strategy 1: Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Find JSON object with brace counting
  const match = cleaned.match(/\{[\s\S]*"cards"[\s\S]*\]/);
  if (match) {
    let braceCount = 0, startIdx = match.index, endIdx = startIdx;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      if (cleaned[i] === '}') braceCount--;
      if (braceCount === 0) { endIdx = i + 1; break; }
    }
    try {
      return JSON.parse(cleaned.substring(startIdx, endIdx));
    } catch (e) {
      // Continue to next strategy
    }
  }

  // Strategy 3: Extract just the cards array
  const cardsMatch = cleaned.match(/"cards"\s*:\s*\[([\s\S]*?)\]/);
  if (cardsMatch) {
    try {
      return JSON.parse(`{"cards":${cardsMatch[0].split(':')[1]}}`);
    } catch (e) {
      // Failed all strategies
    }
  }

  throw new Error('Could not extract valid JSON from response');
}

/**
 * Main serverless function handler
 */
export default async function handler(req, res) {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             req.socket.remoteAddress ||
             'unknown';

  // Check rate limit
  const rateLimitResult = checkRateLimit(ip);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  try {
    const { query, cardInfo } = req.body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query parameter' });
    }

    if (!cardInfo || typeof cardInfo !== 'string') {
      return res.status(400).json({ error: 'Invalid cardInfo parameter' });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API key not configured. Please contact the administrator.'
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1800,
      messages: [{
        role: "user",
        content: `Analyze this purchase: "${query}"

Cards available:
${cardInfo}

CRITICAL: You must respond with ONLY valid JSON. No explanatory text before or after.

Provide the TOP 2 best cards for this purchase in this EXACT format:
{"cards":[{"card":"exact card name","rate":"#x points/miles/% cash back","reason":"brief explanation"},{"card":"exact card name","rate":"#x points/miles/% cash back","reason":"brief explanation"}]}

DO NOT include markdown, code fences, or any text outside the JSON object.`
      }]
    });

    // Extract the response text
    if (!message.content?.[0]?.text) {
      throw new Error('Empty response from Claude API');
    }

    const responseText = message.content[0].text;

    // Parse the JSON response
    const result = extractJSON(responseText);

    // Validate the response structure
    if (!result.cards || !Array.isArray(result.cards)) {
      throw new Error('Invalid response structure: missing cards array');
    }

    if (result.cards.length === 0) {
      throw new Error('No cards returned in response');
    }

    // Validate each card has required fields
    const validCards = result.cards.filter(card =>
      card.card && card.rate && card.reason
    );

    if (validCards.length === 0) {
      throw new Error('No valid cards in response');
    }

    // Return the top 2 cards
    return res.status(200).json({
      cards: validCards.slice(0, 2)
    });

  } catch (error) {
    console.error('Error in analyze API:', error);

    // Handle specific error types
    if (error.status === 401) {
      return res.status(500).json({
        error: 'API authentication failed',
        message: 'Invalid API key configuration'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'API rate limit',
        message: 'Anthropic API rate limit exceeded. Please try again later.'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
