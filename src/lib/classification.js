/**
 * Determines the source, medium, and channel of a visit based on UTMs and Referrer.
 */
export function classifySource(referrer, utms = {}) {
  const { utm_source, utm_medium, utm_campaign } = utms;

  // 1. UTM Parameters have highest priority
  if (utm_source) {
    return {
      source: utm_source,
      medium: utm_medium || 'unknown',
      channel: utm_medium === 'organic' ? 'Organic Search' 
               : utm_medium === 'social' ? 'Social' 
               : utm_medium === 'email' ? 'Email' 
               : utm_medium === 'cpc' ? 'Paid Search'
               : 'Other',
    };
  }

  // 2. No Referrer -> Direct
  if (!referrer || referrer.trim() === '') {
    return {
      source: 'Direct / Unknown',
      medium: 'none',
      channel: 'Direct',
    };
  }

  const refUrl = safeUrl(referrer);
  const hostname = refUrl ? refUrl.hostname.toLowerCase() : referrer.toLowerCase();

  // 3. Known Search Engines
  if (hostname.includes('google.')) return { source: 'Google', medium: 'organic', channel: 'Organic Search' };
  if (hostname.includes('bing.')) return { source: 'Bing', medium: 'organic', channel: 'Organic Search' };
  if (hostname.includes('yahoo.')) return { source: 'Yahoo', medium: 'organic', channel: 'Organic Search' };
  if (hostname.includes('duckduckgo.')) return { source: 'DuckDuckGo', medium: 'organic', channel: 'Organic Search' };
  if (hostname.includes('yandex.')) return { source: 'Yandex', medium: 'organic', channel: 'Organic Search' };

  // 4. Known Social Media
  if (hostname.includes('linkedin.com')) return { source: 'LinkedIn', medium: 'social', channel: 'Social' };
  if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return { source: 'Facebook', medium: 'social', channel: 'Social' };
  if (hostname.includes('instagram.com')) return { source: 'Instagram', medium: 'social', channel: 'Social' };
  if (hostname.includes('twitter.com') || hostname.includes('t.co')) return { source: 'Twitter', medium: 'social', channel: 'Social' };
  if (hostname.includes('youtube.com')) return { source: 'YouTube', medium: 'social', channel: 'Social' };
  if (hostname.includes('github.com')) return { source: 'GitHub', medium: 'referral', channel: 'Referral' };

  // 5. Unknown Referrer -> Referral
  return {
    source: hostname, // Just use the domain as the source
    medium: 'referral',
    channel: 'Referral',
  };
}

function safeUrl(urlString) {
  try {
    return new URL(urlString);
  } catch (e) {
    return null;
  }
}
