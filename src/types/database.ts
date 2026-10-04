export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'programmer'
  | 'producer'
  | 'finance'
  | 'marketing'
  | 'editor'
  | 'analyst'
  | 'pending';

export type AccountStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  reported_by: string;
  reported_at: string;
  assigned_to?: string;
  resolution_notes?: string;
  department_notified?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  account_status?: AccountStatus;
  request_department?: string;
  request_reason?: string;
  requested_role?: UserRole;
  requested_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  avatar_url?: string;
  whatsapp?: string;
  linkedin?: string;
  password?: string;
}

export interface ServiceItem {
  number: string;
  title: string;
  desc: string;
}

export interface WorkflowItem {
  number: string;
  title: string;
  color: string;
  desc: string;
}

export interface ValueItem {
  title: string;
  desc: string;
}

export interface AgencySettings {
  id: string;
  agency_name: string;
  official_email: string;
  admin_whatsapp_number: string;
  whatsapp_prefilled_message: string;
  studio_address: string;
  instagram_url: string;
  linkedin_url: string;
  logo_light_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  updated_at: string;

  // Homepage Copywriting & CMS Fields
  hero_title_prefix?: string;
  hero_title_accent?: string;
  hero_title_suffix?: string;
  hero_subtitle?: string;
  hero_cta_primary?: string;
  hero_cta_secondary?: string;

  services_subtitle?: string;
  services_title?: string;
  services_desc?: string;
  services_list?: ServiceItem[];

  workflow_subtitle?: string;
  workflow_title?: string;
  workflow_desc?: string;
  workflow_list?: WorkflowItem[];

  cta_banner_title?: string;
  cta_banner_desc?: string;
  cta_banner_btn_text?: string;

  // About Page Copywriting & CMS Fields
  about_subtitle?: string;
  about_title_prefix?: string;
  about_title_accent?: string;
  about_desc?: string;
  about_philosophy_title?: string;
  about_philosophy_content?: string;
  about_vision_title?: string;
  about_vision_desc?: string;
  about_values_subtitle?: string;
  about_values_title?: string;
  about_values_list?: ValueItem[];

  // SEO & OpenGraph Metadata Fields
  seo_site_title?: string;
  seo_meta_description?: string;
  seo_og_image_url?: string;
  seo_keywords?: string;
  seo_twitter_card?: 'summary_large_image' | 'summary';
  seo_schema_type?: 'ProfessionalService' | 'WebApplication' | 'Organization';
  seo_page_overrides?: {
    home?: { title: string; desc: string };
    projects?: { title: string; desc: string };
    articles?: { title: string; desc: string };
    about?: { title: string; desc: string };
    contact?: { title: string; desc: string };
  };
}

export interface ClientLogo {
  id: string;
  brand_name: string;
  logo_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order_index: number;
}

export interface TeamMember {
  id: string;
  full_name: string;
  default_role: string;
  avatar_url?: string;
  initials: string;
  bio?: string;
  instagram_url?: string;
  linkedin_url?: string;
  order_index: number;
  is_active?: boolean;
  created_at?: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  image_url: string;
  caption?: string;
  order_index: number;
}

export interface ProjectCrew {
  id: string;
  project_id: string;
  team_member_id?: string;
  custom_role_in_project: string;
  member_name?: string;
  is_external?: boolean;
  // Joined member details
  member?: TeamMember;
}

export type MilestoneStage =
  | 'BRIEF'
  | 'CONCEPT'
  | 'PRODUCTION'
  | 'REVIEW'
  | 'DELIVERY'
  | 'COMPLETED';

export interface MilestoneChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
}

export interface ProjectMilestoneItem {
  id: string;
  stage: MilestoneStage;
  title: string;
  description?: string;
  target_date?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  completed_at?: string;
  checklist: MilestoneChecklistItem[];
  client_visible: boolean;
  client_notes?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  client_name: string;
  description: string;
  media_type: 'IMAGE' | 'VIDEO';
  video_aspect_ratio?: '16:9' | '9:16';
  youtube_video_id?: string;
  is_featured: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  progress_stage?: 'DISCOVERY' | 'DESIGN' | 'DEVELOPMENT' | 'REVIEW' | 'COMPLETED' | MilestoneStage | string;
  completion_percentage?: number;
  target_delivery_date?: string;
  deliverables?: string[];
  impact_metric?: string;
  tags?: string[];
  milestones?: ProjectMilestoneItem[];
  created_at: string;
  updated_at?: string;
  // Related data
  category?: Category;
  media?: ProjectMedia[];
  crews?: ProjectCrew[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  excerpt: string;
  content_html: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED';
  published_at: string;
  created_at?: string;
  reading_time?: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_company_or_brand: string;
  testimonial_text: string;
  rating: number;
  is_active: boolean;
  order_index?: number;
  company_or_title?: string;
  quote?: string;
  created_at: string;
}

export type InquiryStatus = 'NEW' | 'IN_DISCUSSION' | 'RESOLVED';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  project_vision: string;
  status: InquiryStatus;
  created_at: string;
}

export type WhatsAppButtonPlacement =
  | 'floating_widget'
  | 'navbar_cta'
  | 'footer_cta'
  | 'contact_page'
  | 'project_detail'
  | 'home_hero';

export type WhatsAppSplitVariantId = 'variant_a' | 'variant_b';

export interface WhatsAppSplitVariant {
  id: WhatsAppSplitVariantId;
  name: string;
  tagline: string;
  short_label: string;
  tooltip_text: string;
  badge_text: string;
  default_message: string;
}

export interface ChatMessage {
  id: string;
  room_id: string; // 'general', group_id, or direct_user_id combo
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  sender_avatar?: string;
  message: string;
  created_at: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    size?: string;
  }[];
  reactions?: Record<string, string[]>; // emoji -> array of user_ids or names
  reply_to?: {
    id: string;
    sender_name: string;
    message_preview: string;
  };
  is_pinned?: boolean;
}

export interface ProductionScheduleEvent {
  id: string;
  title: string;
  project_id?: string;
  project_title?: string;
  client_name?: string;
  type: 'shoot' | 'meeting' | 'editing' | 'review' | 'delivery' | 'invoice_due';
  start_date: string;
  end_date?: string;
  start_time?: string;
  location?: string;
  assigned_to?: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'chat' | 'inquiry' | 'invoice' | 'proposal' | 'brief' | 'bug' | 'user' | 'schedule';
  link: string;
  created_at: string;
  is_read: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface ChatRoom {
  id: string; // 'general' or 'group-<timestamp>' or 'dm-<user1>-<user2>'
  name: string;
  type: 'general' | 'group' | 'dm';
  description?: string;
  created_by?: string;
  created_at: string;
  members?: string[]; // user IDs or roles
}

export interface WhatsAppImpressionLog {
  id: string;
  variant_id: WhatsAppSplitVariantId;
  source_path: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  created_at: string;
}

export interface WhatsAppProjectContext {
  id?: string;
  title?: string;
  category?: string;
  client?: string;
}

export interface WhatsAppChatLog {
  id: string;
  source_path: string;
  page_title?: string;
  message?: string;
  recipient?: string;
  project_context?: WhatsAppProjectContext;
  button_placement: WhatsAppButtonPlacement;
  split_test_variant?: WhatsAppSplitVariantId;
  split_test_cta?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  operating_system?: string;
  browser_name?: string;
  screen_resolution?: string;
  viewport_size?: string;
  language?: string;
  referrer?: string;
  prefilled_message?: string;
  metadata?: Record<string, any>;
  status?: string;
  timestamp?: string;
  created_at: string;
  day_of_week?: string;
  hour_of_day?: number;
}

export type WhatsAppClickLog = WhatsAppChatLog;

export interface PageViewEvent {
  id: string;
  path: string;
  title: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser_name: string;
  operating_system: string;
  referrer: string;
  created_at: string;
}

export interface ShareEvent {
  id: string;
  item_type: 'project' | 'article' | 'page';
  item_id?: string;
  item_title: string;
  item_slug?: string;
  action: 'copy_link' | 'share_whatsapp' | 'share_linkedin' | 'share_twitter' | 'share_native';
  path: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser_name?: string;
  operating_system?: string;
  created_at: string;
}
