/**
 * TypeScript Type Contracts for Modern Task UI
 * Feature: 003-modern-task-ui
 * 
 * This file contains all TypeScript interfaces and types for the modern task management UI.
 * These types correspond to the API schema defined in api-schema.yaml.
 * 
 * Import these types throughout the application for type safety.
 */

// ========== CORE TYPES ==========

export type TaskPriority = 'low' | 'medium' | 'high'
export type ViewMode = 'list' | 'board' | 'calendar' | 'timeline'
export type GroupingOption = 'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'
export type NotificationEventType = 'assignment' | 'mention' | 'comment' | 'status_change'
export type CustomFieldType = 'text' | 'textarea' | 'number' | 'currency' | 'dropdown' | 'multi-select' | 'checkbox' | 'date' | 'url' | 'email'

// ========== TASK ENTITIES ==========

export interface Task {
  id: string
  projectId?: string | null
  resourceId?: string | null
  teamId: string
  stageId: string
  title: string
  description?: string
  completed: boolean // Deprecated: use stage.isCompletionStage
  dueDate?: string | null // ISO date string
  priority: TaskPriority
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskDetail extends Task {
  subtasks: Subtask[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  customFieldValues?: TaskCustomFieldValue[]
  subtaskCompletion: {
    completed: number
    total: number
    percentage: number
  }
}

export interface TaskCreateInput {
  title: string
  description?: string
  projectId?: string | null
  resourceId?: string | null
  teamId?: string // Optional if projectId provided (derived from project)
  stageId?: string // Optional: defaults to first non-completion stage
  priority?: TaskPriority
  dueDate?: string
  assignedTo?: string
  subtasks?: Array<{
    title: string
    order: number
  }>
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  stageId?: string
  priority?: TaskPriority
  dueDate?: string | null
  assignedTo?: string | null
  projectId?: string | null
  resourceId?: string | null
}

export interface TaskBulkUpdateInput {
  taskIds: string[]
  updates: TaskUpdateInput
}

export interface TaskBulkUpdateResponse {
  updated: number
  failed: string[]
}

// ========== SUBTASKS ==========

export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface SubtaskCreateInput {
  title: string
  displayOrder?: number
}

export interface SubtaskUpdateInput {
  title?: string
  completed?: boolean
  displayOrder?: number
}

// ========== COMMENTS ==========

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[] // Array of user IDs
  deleted: boolean
  createdAt: string
  updatedAt: string
  
  // Populated from joins (optional)
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskCommentCreateInput {
  content: string
  mentions?: string[]
}

export interface TaskCommentUpdateInput {
  content: string
  mentions?: string[]
}

// ========== ATTACHMENTS ==========

export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileSize: number // bytes
  mimeType: string
  storageUrl: string
  uploadedBy: string
  createdAt: string
  
  // Populated from joins (optional)
  uploader?: {
    id: string
    name: string
  }
  signedUrl?: string // Generated on-demand
}

export interface TaskAttachmentCreateInput {
  fileName: string
  fileSize: number
  mimeType: string
}

export interface TaskAttachmentCreateResponse {
  attachment: TaskAttachment
  uploadUrl: string // Presigned URL for upload
}

export interface TaskAttachmentSignedUrlResponse {
  signedUrl: string
  expiresAt: string
}

// ========== NOTIFICATIONS ==========

export interface TaskNotification {
  id: string
  userId: string
  taskId: string
  eventType: NotificationEventType
  message: string
  read: boolean
  actorUserId?: string | null
  metadata: Record<string, any>
  createdAt: string
  
  // Populated from joins (optional)
  task?: {
    id: string
    title: string
  }
  actor?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskNotificationListResponse {
  data: TaskNotification[]
  unreadCount: number
}

export interface TaskNotificationUpdateInput {
  read: boolean
}

export interface TaskNotificationMarkAllReadResponse {
  updated: number
}

// ========== TEMPLATES ==========

export interface TaskTemplateSubtask {
  title: string
  order: number
}

export interface TaskTemplate {
  id: string
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority: TaskPriority
  subtasks: TaskTemplateSubtask[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateCreateInput {
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority?: TaskPriority
  subtasks?: TaskTemplateSubtask[]
}

export interface TaskTemplateUpdateInput {
  name?: string
  description?: string
  defaultStageId?: string
  defaultPriority?: TaskPriority
  subtasks?: TaskTemplateSubtask[]
}

export interface TaskTemplateApplyInput {
  title: string
  projectId?: string
}

// ========== SAVED VIEWS ==========

export interface TaskFilters {
  stages?: string[]
  priorities?: TaskPriority[]
  assignees?: string[]
  projects?: string[]
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
  includeArchived?: boolean
}

export interface SavedTaskView {
  id: string
  userId: string
  teamId: string
  name: string
  filters: TaskFilters
  grouping: GroupingOption
  viewMode: ViewMode
  createdAt: string
  updatedAt: string
}

export interface SavedTaskViewCreateInput {
  teamId: string
  name: string
  filters: TaskFilters
  grouping?: GroupingOption
  viewMode?: ViewMode
}

export interface SavedTaskViewUpdateInput {
  name?: string
  filters?: TaskFilters
  grouping?: GroupingOption
  viewMode?: ViewMode
}

// ========== API RESPONSE WRAPPERS ==========

export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
  count: number
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// ========== FILTER & QUERY TYPES ==========

export interface TaskQueryParams {
  teamId: string
  view?: ViewMode
  filter?: string // JSON-encoded TaskFilters
  groupBy?: GroupingOption
  search?: string
  includeSubtasks?: boolean
}

export interface TaskDetailQueryParams {
  includeSubtasks?: boolean
  includeComments?: boolean
  includeAttachments?: boolean
}

export interface NotificationQueryParams {
  unread?: boolean
  limit?: number
  offset?: number
}

// ========== UTILITY TYPES ==========

/**
 * Parsed task metadata from natural language parsing
 */
export interface ParsedTaskMetadata {
  title: string // Cleaned title (metadata removed)
  priority?: TaskPriority
  dueDate?: string // ISO date string
  projectMention?: string
  tags?: string[]
}

/**
 * Task grouping data structure for UI rendering
 */
export interface TaskGroup {
  key: string // Group identifier (stageId, priority, etc.)
  label: string // Display label
  tasks: Task[]
  count: number
}

/**
 * Task card display props (for list/board views)
 */
export interface TaskCardData {
  task: Task
  subtaskProgress?: {
    completed: number
    total: number
    percentage: number
  }
  stage?: {
    id: string
    name: string
    color?: string
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  project?: {
    id: string
    name: string
  }
}

/**
 * Drag-and-drop task data
 */
export interface DraggedTask {
  id: string
  sourceStageId: string
  sourceIndex: number
}

/**
 * Calendar day data for calendar view
 */
export interface CalendarDay {
  date: Date
  tasks: Task[]
  isCurrentMonth: boolean
  isToday: boolean
}

/**
 * Timeline task bar position
 */
export interface TimelineTaskPosition {
  left: string // CSS value (e.g., "100px")
  width: string // CSS value (e.g., "200px")
  top: string // CSS value for vertical position
}

// ========== CUSTOM FIELDS ==========

/**
 * Custom field definition for a team
 */
export interface CustomFieldDefinition {
  id: string
  teamId: string
  fieldName: string
  fieldType: CustomFieldType
  required: boolean
  defaultValue?: string | null
  options?: CustomFieldOptions
  displayOrder: number
  showOnCard: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Options for different custom field types
 */
export interface CustomFieldOptions {
  // For dropdown/multi-select: array of choice strings
  choices?: string[]
  // For currency: default currency code (ISO 4217)
  defaultCurrency?: string
  // For number: min/max values
  min?: number
  max?: number
}

/**
 * Custom field value for a specific task
 */
export interface TaskCustomFieldValue {
  id: string
  taskId: string
  fieldDefinitionId: string
  value: string | null // Stored as TEXT, parsed based on field type
  createdAt: string
  updatedAt: string
  // Populated when joined with field definition
  fieldDefinition?: CustomFieldDefinition
}

/**
 * Parsed custom field value (application layer)
 */
export interface ParsedCustomFieldValue {
  fieldDefinitionId: string
  fieldName: string
  fieldType: CustomFieldType
  rawValue: string | null
  parsedValue: CustomFieldValueTypes
}

/**
 * Union type for parsed custom field values
 */
export type CustomFieldValueTypes = 
  | string                                          // text, textarea, url, email
  | number                                          // number
  | boolean                                         // checkbox
  | { amount: number; currency: string }           // currency
  | string[]                                        // multi-select
  | Date                                            // date

/**
 * Create custom field definition input
 */
export interface CustomFieldDefinitionCreateInput {
  fieldName: string
  fieldType: CustomFieldType
  required?: boolean
  defaultValue?: string
  options?: CustomFieldOptions
  displayOrder?: number
  showOnCard?: boolean
}

/**
 * Update custom field definition input
 */
export interface CustomFieldDefinitionUpdateInput {
  fieldName?: string
  required?: boolean
  defaultValue?: string
  options?: CustomFieldOptions
  displayOrder?: number
  showOnCard?: boolean
}

/**
 * Set custom field value input
 */
export interface TaskCustomFieldValueSetInput {
  fieldDefinitionId: string
  value: string | null
}

/**
 * Currency value structure for currency fields
 */
export interface CurrencyValue {
  amount: string // Stored as string to avoid floating point issues
  currency: string // ISO 4217 currency code (USD, EUR, GBP, etc.)
}

/**
 * Custom field export data
 */
export interface CustomFieldExport {
  definitions: CustomFieldDefinition[]
  exportedAt: string
  teamId: string
}

/**
 * Custom field import result
 */
export interface CustomFieldImportResult {
  imported: number
  skipped: number
  conflicts: Array<{
    fieldName: string
    reason: string
    action: 'renamed' | 'skipped' | 'merged'
  }>
}

// ========== VALIDATION SCHEMAS (ZOD) ==========

/**
 * Zod schemas for runtime validation
 * Import from 'zod' when using these
 */

export const TaskPrioritySchema = ['low', 'medium', 'high'] as const

export const ViewModeSchema = ['list', 'board', 'calendar', 'timeline'] as const

export const GroupingOptionSchema = ['stage', 'priority', 'project', 'assignee', 'dueDate'] as const

export const NotificationEventTypeSchema = ['assignment', 'mention', 'comment', 'status_change'] as const

export const CustomFieldTypeSchema = ['text', 'textarea', 'number', 'currency', 'dropdown', 'multi-select', 'checkbox', 'date', 'url', 'email'] as const

// ========== TYPE GUARDS ==========

export function isTaskDetail(task: Task | TaskDetail): task is TaskDetail {
  return 'subtasks' in task
}

export function isPriority(value: string): value is TaskPriority {
  return ['low', 'medium', 'high'].includes(value)
}

export function isViewMode(value: string): value is ViewMode {
  return ['list', 'board', 'calendar', 'timeline'].includes(value)
}

export function isGroupingOption(value: string): value is GroupingOption {
  return ['stage', 'priority', 'project', 'assignee', 'dueDate'].includes(value)
}

export function isNotificationEventType(value: string): value is NotificationEventType {
  return ['assignment', 'mention', 'comment', 'status_change'].includes(value)
}

export function isCustomFieldType(value: string): value is CustomFieldType {
  return ['text', 'textarea', 'number', 'currency', 'dropdown', 'multi-select', 'checkbox', 'date', 'url', 'email'].includes(value)
}

// ========== CONSTANTS ==========

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-blue-600 bg-blue-50',
  low: 'text-gray-600 bg-gray-50',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  list: 'List',
  board: 'Board',
  calendar: 'Calendar',
  timeline: 'Timeline',
}

export const GROUPING_LABELS: Record<GroupingOption, string> = {
  stage: 'Stage',
  priority: 'Priority',
  project: 'Project',
  assignee: 'Assignee',
  dueDate: 'Due Date',
}

export const MAX_SUBTASKS_PER_TASK = 50
export const MAX_ATTACHMENTS_PER_TASK = 20
export const MAX_TEMPLATES_PER_TEAM = 50
export const MAX_SAVED_VIEWS_PER_USER = 20
export const MAX_COMMENT_LENGTH = 10000
export const MAX_FILE_SIZE = 26214400 // 25MB in bytes
export const MAX_CUSTOM_FIELDS_PER_TEAM = 20

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  textarea: 'Textarea',
  number: 'Number',
  currency: 'Currency',
  dropdown: 'Dropdown',
  'multi-select': 'Multi-Select',
  checkbox: 'Checkbox',
  date: 'Date',
  url: 'URL',
  email: 'Email',
}

// Common currency codes for currency fields
export const COMMON_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'] as const

// ========== EXPORT ALL ==========

export type {
  // Re-export all types for convenience
  Task,
  TaskDetail,
  TaskCreateInput,
  TaskUpdateInput,
  Subtask,
  SubtaskCreateInput,
  SubtaskUpdateInput,
  TaskComment,
  TaskCommentCreateInput,
  TaskCommentUpdateInput,
  TaskAttachment,
  TaskAttachmentCreateInput,
  TaskNotification,
  TaskTemplate,
  TaskTemplateCreateInput,
  TaskTemplateUpdateInput,
  SavedTaskView,
  SavedTaskViewCreateInput,
  SavedTaskViewUpdateInput,
  TaskFilters,
  CustomFieldDefinition,
  CustomFieldDefinitionCreateInput,
  CustomFieldDefinitionUpdateInput,
  TaskCustomFieldValue,
  TaskCustomFieldValueSetInput,
  ParsedCustomFieldValue,
  CurrencyValue,
  CustomFieldExport,
  CustomFieldImportResult,
}

