import { WhatsAppClickLog, WhatsAppButtonPlacement, WhatsAppChatLog, WhatsAppProjectContext, WhatsAppSplitVariantId, PageViewEvent, ShareEvent } from '../types/database';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Detect client operating system, browser, device category, and screen telemetry.
 */
export function getVisitorTelemetry() {
  if (typeof window === 'undefined') {
    return {
      device_type: 'desktop' as const,
      operating_system: 'Unknown',
      browser_name: 'Unknown',
      screen_resolution: '1920x1080',
      viewport_size: '1920x1080',
      language: 'id-ID',
      referrer: 'direct',
    };
  }

  const userAgent = navigator.userAgent || '';
  const screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const viewportSize = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
  const language = navigator.language || 'id-ID';
  const referrer = document.referrer ? new URL(document.referrer, window.location.origin).hostname || 'external' : 'direct';

  // Device detection
  let device_type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(userAgent);
  const isMobile = /mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|android/i.test(userAgent);

  if (isTablet) {
    device_type = 'tablet';
  } else if (isMobile) {
    device_type = 'mobile';
  }

  // OS detection
  let operating_system = 'Other';
  if (/windows/i.test(userAgent)) operating_system = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent)) operating_system = 'macOS';
  else if (/android/i.test(userAgent)) operating_system = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) operating_system = 'iOS';
  else if (/linux/i.test(userAgent)) operating_system = 'Linux';

  // Browser detection
  let browser_name = 'Other';
  if (/instagram/i.test(userAgent)) browser_name = 'Instagram In-App';
  else if (/tiktok/i.test(userAgent)) browser_name = 'TikTok In-App';
  else if (/edg/i.test(userAgent)) browser_name = 'Microsoft Edge';
  else if (/chrome|crios/i.test(userAgent) && !/opr|opera/i.test(userAgent)) browser_name = 'Google Chrome';
  else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser_name = 'Apple Safari';
  else if (/firefox|fxios/i.test(userAgent)) browser_name = 'Mozilla Firefox';
  else if (/opr|opera/i.test(userAgent)) browser_name = 'Opera';

  return {
    device_type,
    operating_system,
    browser_name,
    screen_resolution: screenResolution,
    viewport_size: viewportSize,
    language,
    referrer,
  };
}

/**
 * Dispatches an event to Google Analytics (gtag) or dataLayer if loaded.
 */
export function fireGoogleAnalyticsEvent(eventName: string, params: Record<string, any>) {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: eventName,
          ...params,
        });
      }
    }
  } catch (err) {
    console.warn('[Analytics] Google Analytics fire error:', err);
  }
}

/**
 * Builds a comprehensive WhatsAppClickLog object ready for persistence and analytics tracking.
 */
export function createWhatsAppClickPayload(options: {
  placement: WhatsAppButtonPlacement;
  prefilledMessage?: string;
  projectContext?: WhatsAppClickLog['project_context'];
  customPath?: string;
  splitTestVariant?: WhatsAppClickLog['split_test_variant'];
  splitTestCta?: string;
}): WhatsAppClickLog {
  const telemetry = getVisitorTelemetry();
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const clickId = 'wac_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const currentPath = options.customPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
  const pageTitle = typeof document !== 'undefined' ? document.title : 'Zekalian Agency';

  const payload: WhatsAppClickLog = {
    id: clickId,
    source_path: currentPath,
    page_title: pageTitle,
    button_placement: options.placement,
    split_test_variant: options.splitTestVariant,
    split_test_cta: options.splitTestCta,
    prefilled_message: options.prefilledMessage,
    project_context: options.projectContext,
    device_type: telemetry.device_type,
    operating_system: telemetry.operating_system,
    browser_name: telemetry.browser_name,
    screen_resolution: telemetry.screen_resolution,
    viewport_size: telemetry.viewport_size,
    language: telemetry.language,
    referrer: telemetry.referrer,
    created_at: now.toISOString(),
    day_of_week: days[now.getDay()],
    hour_of_day: now.getHours(),
  };

  // Fire to Google Analytics event
  fireGoogleAnalyticsEvent('contact_whatsapp_click', {
    event_category: 'lead_generation',
    event_label: options.placement,
    source_path: payload.source_path,
    page_title: payload.page_title,
    device_type: payload.device_type,
    operating_system: payload.operating_system,
    project_title: options.projectContext?.title,
    split_test_variant: options.splitTestVariant,
    split_test_cta: options.splitTestCta,
    value: 1,
  });

  return payload;
}

/**
 * Builds an automated outgoing WhatsApp message archive log with metadata and project context.
 */
export function createWhatsAppChatLogPayload(options: {
  message: string;
  recipient?: string;
  placement?: WhatsAppButtonPlacement | string;
  projectContext?: WhatsAppProjectContext;
  customPath?: string;
  splitTestVariant?: WhatsAppSplitVariantId | string;
  splitTestCta?: string;
  targetUrl?: string;
}): WhatsAppChatLog {
  const telemetry = getVisitorTelemetry();
  const now = new Date();
  const logId = 'chatlog_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const currentPath =
    options.customPath ||
    (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
  const pageTitle = typeof document !== 'undefined' ? document.title : 'Zekalian Agency';

  const payload: WhatsAppChatLog = {
    id: logId,
    message: options.message,
    recipient: options.recipient || 'Official WhatsApp',
    source_path: currentPath,
    page_title: pageTitle,
    button_placement: (options.placement || 'floating_widget') as WhatsAppButtonPlacement,
    project_context: options.projectContext,
    metadata: {
      timestamp: now.toISOString(),
      device_type: telemetry.device_type,
      browser_name: telemetry.browser_name,
      operating_system: telemetry.operating_system,
      screen_resolution: telemetry.screen_resolution,
      viewport_size: telemetry.viewport_size,
      language: telemetry.language,
      referrer: telemetry.referrer,
      split_test_variant: options.splitTestVariant,
      split_test_cta: options.splitTestCta,
      target_url: options.targetUrl,
    },
    status: 'sent',
    timestamp: now.toISOString(),
    created_at: now.toISOString(),
  };

  return payload;
}

/**
 * Builds a PageViewEvent payload from the current browser session.
 */
export function createPageViewPayload(path: string, title?: string): PageViewEvent {
  const telemetry = getVisitorTelemetry();
  const id = 'pv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const resolvedTitle = title || (typeof document !== 'undefined' ? document.title : 'Zekalian');

  return {
    id,
    path: path || '/',
    title: resolvedTitle,
    device_type: telemetry.device_type,
    browser_name: telemetry.browser_name,
    operating_system: telemetry.operating_system,
    referrer: telemetry.referrer,
    created_at: new Date().toISOString(),
  };
}

/**
 * Builds a ShareEvent payload from user interactions (Copy Link, WhatsApp share, LinkedIn, etc.)
 */
export function createShareEventPayload(options: {
  item_type: 'project' | 'article' | 'page';
  item_id?: string;
  item_title: string;
  item_slug?: string;
  action: 'copy_link' | 'share_whatsapp' | 'share_linkedin' | 'share_twitter' | 'share_native';
  path?: string;
}): ShareEvent {
  const telemetry = getVisitorTelemetry();
  const id = 'sh_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const currentPath =
    options.path ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');

  return {
    id,
    item_type: options.item_type,
    item_id: options.item_id,
    item_title: options.item_title,
    item_slug: options.item_slug,
    action: options.action,
    path: currentPath,
    device_type: telemetry.device_type,
    browser_name: telemetry.browser_name,
    operating_system: telemetry.operating_system,
    created_at: new Date().toISOString(),
  };
}

