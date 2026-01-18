/**
 * Tree-shaking optimization configuration
 * This file helps ensure unused code is properly eliminated from the bundle
 */

// Explicitly import only what we need from large libraries
export { format, parseISO, isAfter, isBefore, addDays, subDays } from 'date-fns';

// Re-export commonly used utilities to enable better tree-shaking
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { clsx, twMerge };

// Flowbite Svelte - import only needed components
export {
  Button,
  Card,
  Input,
  Select,
  Modal,
  Dropdown,
  Tooltip,
  Badge,
  Avatar,
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarWrapper,
  Datepicker
} from 'flowbite-svelte';

// Lucide icons - import only used icons
export {
  Home,
  Users,
  Calendar,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Camera,
  Image,
  Palette,
  Wrench,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-svelte';

// Utility function to create optimized class merger
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}