/**
 * API Contract Types
 * 
 * TypeScript types generated from OpenAPI schema (api-schema.yaml).
 * These types define the shape of data exchanged between frontend and backend.
 * 
 * @file specs/002-mvp-redesign/contracts/types.ts
 * @generated 2025-10-30
 */

// ============================================================================
// Enums
// ============================================================================

export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export enum IdeaStatus {
  Saved = 'saved',
  Converted = 'converted'
}

export enum ProjectStatus {
  Planning = 'planning',
  InProgress = 'in-progress',
  Completed = 'completed',
  Archived = 'archived'
}

export enum ResourceCategory {
  Prop = 'prop',
  Fabric = 'fabric',
  Wig = 'wig',
  Pattern = 'pattern',
  CostumePiece = 'costume-piece',
  Accessory = 'accessory',
  Material = 'material'
}

export enum ToolCategory {
  CraftingTool = 'crafting-tool',
  ShootEquipment = 'shoot-equipment'
}

export enum ResourceStatus {
  Needed = 'needed',
  Acquired = 'acquired',
  InProgress = 'in-progress',
  Completed = 'completed'
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum PhotoshootStatus {
  Planning = 'planning',
  Scheduled = 'scheduled',
  Completed = 'completed'
}

export enum CrewRole {
  Photographer = 'photographer',
  Assistant = 'assistant',
  Makeup = 'makeup',
  Other = 'other'
}

export enum TeamType {
  Personal = 'personal',
  Private = 'private'
}

export enum TeamRole {
  Owner = 'owner',
  Editor = 'editor',
  Viewer = 'viewer'
}

export enum TeamMemberStatus {
  Invited = 'invited',
  Active = 'active',
  Inactive = 'inactive'
}

export enum CommentEntityType {
  Idea = 'idea',
  Project = 'project',
  Resource = 'resource',
  Tool = 'tool',
  Photoshoot = 'photoshoot'
}

export enum FabricUnit {
  Yards = 'yards',
  Meters = 'meters'
}

export enum LaceType {
  None = 'none',
  LaceFront = 'lace-front',
  FullLace = 'full-lace'
}

export enum ToolCondition {
  New = 'new',
  Good = 'good',
  Fair = 'fair',
  NeedsRepair = 'needs-repair'
}

// ============================================================================
// Core Domain Models
// ============================================================================

export interface Idea {
  id: string
  teamId: string
  character: string
  series: string
  description?: string
  difficulty: Difficulty
  estimatedCost?: number
  images: string[]
  tags: string[]
  notes?: string
  status: IdeaStatus
  convertedProjectId?: string | null
  createdAt: string
  updatedAt: string
}

export interface IdeaCreate {
  character: string
  series: string
  description?: string
  difficulty: Difficulty
  estimatedCost?: number
  images?: string[]
  tags?: string[]
  notes?: string
}

export interface IdeaUpdate {
  character?: string
  series?: string
  description?: string
  difficulty?: Difficulty
  estimatedCost?: number
  images?: string[]
  tags?: string[]
  notes?: string
}

export interface Project {
  id: string
  teamId: string
  fromIdeaId?: string | null
  character: string
  series: string
  status: ProjectStatus
  progress: number
  estimatedBudget?: number | null
  spentBudget: number
  deadline?: string | null
  description?: string
  coverImage?: string | null
  referenceImages: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProjectCreate {
  fromIdeaId?: string
  character: string
  series: string
  status?: ProjectStatus
  estimatedBudget?: number
  deadline?: string
  description?: string
  coverImage?: string
  referenceImages?: string[]
  tags?: string[]
}

export interface ProjectUpdate {
  character?: string
  series?: string
  status?: ProjectStatus
  estimatedBudget?: number
  spentBudget?: number
  deadline?: string
  description?: string
  coverImage?: string
  referenceImages?: string[]
  tags?: string[]
}

// ============================================================================
// Resource Metadata (Polymorphic)
// ============================================================================

export interface PropMetadata {
  category: ResourceCategory.Prop
  dimensions?: string
  weight?: string
  material?: string
  fragile?: boolean
  requiresAssembly?: boolean
  storageLocation?: string
}

export interface FabricMetadata {
  category: ResourceCategory.Fabric
  fabricType: string
  color: string
  quantity: number
  unit: FabricUnit
  width?: number
  stretch?: boolean
  washable?: boolean
}

export interface WigMetadata {
  category: ResourceCategory.Wig
  color: string
  length: string
  style: string
  needsStyling?: boolean
  laceType?: LaceType
  heatResistant?: boolean
}

export interface PatternMetadata {
  category: ResourceCategory.Pattern
  patternCompany?: string
  patternNumber?: string
  size?: string
  difficulty?: Difficulty
  digitalFileUrl?: string
  physicalPattern?: boolean
}

export interface CostumePieceMetadata {
  category: ResourceCategory.CostumePiece
  pieceType?: string
  size?: string
  material?: string
  color?: string
  needsAlterations?: boolean
}

export interface AccessoryMetadata {
  category: ResourceCategory.Accessory
  accessoryType?: string
  material?: string
  color?: string
  quantity?: number
}

export interface MaterialMetadata {
  category: ResourceCategory.Material
  materialType?: string
  brand?: string
  colorVariant?: string
  quantity?: number
  unit?: string
}

export type ResourceMetadata =
  | PropMetadata
  | FabricMetadata
  | WigMetadata
  | PatternMetadata
  | CostumePieceMetadata
  | AccessoryMetadata
  | MaterialMetadata

export interface Resource {
  id: string
  teamId: string
  name: string
  description?: string
  images: string[]
  cost?: number | null
  tags: string[]
  notes?: string
  metadata: ResourceMetadata
  createdAt: string
  updatedAt: string
}

export interface ResourceCreate {
  name: string
  description?: string
  images?: string[]
  cost?: number
  tags?: string[]
  notes?: string
  metadata: ResourceMetadata
}

export type ResourceUpdate = ResourceCreate

// ============================================================================
// Tool Metadata (Polymorphic)
// ============================================================================

export interface CraftingToolMetadata {
  category: ToolCategory.CraftingTool
  brand?: string
  model?: string
  purchaseDate?: string
  purchasePrice?: number
  condition?: ToolCondition
  storageLocation?: string
  manualUrl?: string
  warrantyExpires?: string
}

export interface ShootEquipmentMetadata {
  category: ToolCategory.ShootEquipment
  brand?: string
  model?: string
  owned?: boolean
  rentalCost?: number | null
  owner?: string | null
  specifications?: string
}

export type ToolMetadata = CraftingToolMetadata | ShootEquipmentMetadata

export interface Tool {
  id: string
  teamId: string
  name: string
  description?: string
  images: string[]
  tags: string[]
  notes?: string
  metadata: ToolMetadata
  createdAt: string
  updatedAt: string
}

export interface ToolCreate {
  name: string
  description?: string
  images?: string[]
  tags?: string[]
  notes?: string
  metadata: ToolMetadata
}

export type ToolUpdate = ToolCreate

// ============================================================================
// Project-Resource Relationship
// ============================================================================

export interface ProjectResource {
  id: string
  projectId: string
  resourceId: string
  quantity: number
  status: ResourceStatus
  notes?: string
  addedAt: string
  resource?: Resource
}

export interface ProjectResourceCreate {
  resourceId: string
  quantity: number
  status?: ResourceStatus
}

export interface ProjectResourceUpdate {
  quantity?: number
  status?: ResourceStatus
  notes?: string
}

// ============================================================================
// Tasks
// ============================================================================

export interface Task {
  id: string
  projectId: string
  resourceId?: string | null
  title: string
  description?: string
  completed: boolean
  dueDate?: string | null
  priority: TaskPriority
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskCreate {
  projectId: string
  resourceId?: string
  title: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  assignedTo?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  completed?: boolean
  dueDate?: string
  priority?: TaskPriority
  assignedTo?: string
}

// ============================================================================
// Photoshoots
// ============================================================================

export interface Shot {
  id: string
  photoshootId: string
  description: string
  pose?: string
  referenceImage?: string | null
  completed: boolean
  finalPhotos: string[]
  orderIndex: number
  createdAt: string
}

export interface ShotCreate {
  description: string
  pose?: string
  referenceImage?: string
  orderIndex?: number
}

export interface ShotUpdate {
  description?: string
  pose?: string
  referenceImage?: string
  completed?: boolean
  finalPhotos?: string[]
  orderIndex?: number
}

export interface CrewMember {
  id: string
  photoshootId: string
  name: string
  role: CrewRole
  contact?: string
  createdAt: string
}

export interface CrewMemberCreate {
  name: string
  role: CrewRole
  contact?: string
}

export interface Photoshoot {
  id: string
  teamId: string
  title: string
  date?: string | null
  location?: string
  description?: string
  status: PhotoshootStatus
  notes?: string
  projects?: Project[]
  shotList?: Shot[]
  crew?: CrewMember[]
  createdAt: string
  updatedAt: string
}

export interface PhotoshootCreate {
  title: string
  date?: string
  location?: string
  description?: string
  projectIds?: string[]
}

export interface PhotoshootUpdate {
  title?: string
  date?: string
  location?: string
  description?: string
  status?: PhotoshootStatus
  notes?: string
}

// ============================================================================
// Teams & Collaboration
// ============================================================================

export interface User {
  id: string
  name?: string
  email: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: TeamRole
  status: TeamMemberStatus
  user?: {
    id: string
    name?: string
    email: string
    avatarUrl?: string
  }
  joinedAt?: string | null
}

export interface Team {
  id: string
  name: string
  type: TeamType
  createdBy: string
  members?: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface TeamCreate {
  name: string
  type?: TeamType
}

export interface TeamInvite {
  email: string
  role: TeamRole
}

// ============================================================================
// Comments
// ============================================================================

export interface Comment {
  id: string
  userId: string
  entityType: CommentEntityType
  entityId: string
  content: string
  author?: {
    id: string
    name?: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CommentCreate {
  entityType: CommentEntityType
  entityId: string
  content: string
}

export interface CommentUpdate {
  content: string
}

// ============================================================================
// Image Processing
// ============================================================================

export interface ImageUploadResult {
  thumbnail: string
  display: string
  original: string
  metadata: {
    originalSize: number
    thumbnailSize: number
    displaySize: number
    dimensions: {
      width: number
      height: number
    }
  }
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}

export interface ProgressBreakdown {
  progress: number
  breakdown: {
    projectTasks: number
    resources: number
  }
}

// ============================================================================
// Type Guards
// ============================================================================

export function isProp(resource: Resource): resource is Resource & { metadata: PropMetadata } {
  return resource.metadata.category === ResourceCategory.Prop
}

export function isFabric(resource: Resource): resource is Resource & { metadata: FabricMetadata } {
  return resource.metadata.category === ResourceCategory.Fabric
}

export function isWig(resource: Resource): resource is Resource & { metadata: WigMetadata } {
  return resource.metadata.category === ResourceCategory.Wig
}

export function isPattern(resource: Resource): resource is Resource & { metadata: PatternMetadata } {
  return resource.metadata.category === ResourceCategory.Pattern
}

export function isCostumePiece(resource: Resource): resource is Resource & { metadata: CostumePieceMetadata } {
  return resource.metadata.category === ResourceCategory.CostumePiece
}

export function isAccessory(resource: Resource): resource is Resource & { metadata: AccessoryMetadata } {
  return resource.metadata.category === ResourceCategory.Accessory
}

export function isMaterial(resource: Resource): resource is Resource & { metadata: MaterialMetadata } {
  return resource.metadata.category === ResourceCategory.Material
}

export function isCraftingTool(tool: Tool): tool is Tool & { metadata: CraftingToolMetadata } {
  return tool.metadata.category === ToolCategory.CraftingTool
}

export function isShootEquipment(tool: Tool): tool is Tool & { metadata: ShootEquipmentMetadata } {
  return tool.metadata.category === ToolCategory.ShootEquipment
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get resource category display name
 */
export function getResourceCategoryLabel(category: ResourceCategory): string {
  switch (category) {
    case ResourceCategory.Prop:
      return 'Prop'
    case ResourceCategory.Fabric:
      return 'Fabric'
    case ResourceCategory.Wig:
      return 'Wig'
    case ResourceCategory.Pattern:
      return 'Pattern'
    case ResourceCategory.CostumePiece:
      return 'Costume Piece'
    case ResourceCategory.Accessory:
      return 'Accessory'
    case ResourceCategory.Material:
      return 'Material'
    default:
      const _exhaustive: never = category
      throw new Error(`Unknown category: ${category}`)
  }
}

/**
 * Get tool category display name
 */
export function getToolCategoryLabel(category: ToolCategory): string {
  switch (category) {
    case ToolCategory.CraftingTool:
      return 'Crafting Tool'
    case ToolCategory.ShootEquipment:
      return 'Shoot Equipment'
    default:
      const _exhaustive: never = category
      throw new Error(`Unknown category: ${category}`)
  }
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: ProjectStatus | PhotoshootStatus | ResourceStatus): string {
  switch (status) {
    case 'planning':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    case 'in-progress':
    case 'acquired':
      return 'bg-primary/10 text-primary'
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    case 'archived':
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    case 'scheduled':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
    case 'needed':
      return 'bg-red-500/10 text-red-700 dark:text-red-300'
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
  }
}

/**
 * Get difficulty badge color class
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.Beginner:
      return 'bg-green-500/10 text-green-700 dark:text-green-300'
    case Difficulty.Intermediate:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
    case Difficulty.Advanced:
      return 'bg-red-500/10 text-red-700 dark:text-red-300'
    default:
      const _exhaustive: never = difficulty
      throw new Error(`Unknown difficulty: ${difficulty}`)
  }
}

/**
 * Get priority badge color class
 */
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.Low:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    case TaskPriority.Medium:
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    case TaskPriority.High:
      return 'bg-red-500/10 text-red-700 dark:text-red-300'
    default:
      const _exhaustive: never = priority
      throw new Error(`Unknown priority: ${priority}`)
  }
}

/**
 * Format date string to localized date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

/**
 * Format date string to localized datetime
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

/**
 * Calculate progress percentage from completed/total
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}


