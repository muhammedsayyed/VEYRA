import {
  House,
  Compass,
  Camera,
  BookOpen,
  Dumbbell,
  Brain,
  Sparkles,
  User,
  Settings,
  Search,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  Flame,
  Droplets,
  Heart,
  Zap,
  Send,
  Scan,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Bell,
  ShoppingCart,
  Calendar,
  Trash2,
  Pencil,
  X,
  TriangleAlert,
  Scale,
  Play,
  RefreshCw,
  Check,
  Upload,
  Barcode,
  Eye,
  EyeOff,
} from "lucide-react"

type IconProps = { size?: number; className?: string }

export function HomeIcon(props: IconProps) { return <House size={props.size} className={props.className} strokeWidth={1.9} /> }
export function CompassIcon(props: IconProps) { return <Compass size={props.size} className={props.className} strokeWidth={1.9} /> }
export function CameraIcon(props: IconProps) { return <Camera size={props.size} className={props.className} strokeWidth={1.9} /> }
export function BookIcon(props: IconProps) { return <BookOpen size={props.size} className={props.className} strokeWidth={1.9} /> }
export function DumbbellIcon(props: IconProps) { return <Dumbbell size={props.size} className={props.className} strokeWidth={1.9} /> }
export function BrainIcon(props: IconProps) { return <Brain size={props.size} className={props.className} strokeWidth={1.9} /> }
export function SparklesIcon(props: IconProps) { return <Sparkles size={props.size} className={props.className} strokeWidth={1.9} /> }
export function UserIcon(props: IconProps) { return <User size={props.size} className={props.className} strokeWidth={1.9} /> }
export function SettingsIcon(props: IconProps) { return <Settings size={props.size} className={props.className} strokeWidth={1.9} /> }
export function SearchIcon(props: IconProps) { return <Search size={props.size} className={props.className} strokeWidth={1.9} /> }
export function PlusIcon(props: IconProps) { return <Plus size={props.size} className={props.className} strokeWidth={2.2} /> }
export function MinusIcon(props: IconProps) { return <Minus size={props.size} className={props.className} strokeWidth={2.2} /> }
export function ChevronRightIcon(props: IconProps) { return <ChevronRight size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ChevronLeftIcon(props: IconProps) { return <ChevronLeft size={props.size} className={props.className} strokeWidth={1.9} /> }
export function FlameIcon(props: IconProps) { return <Flame size={props.size} className={props.className} strokeWidth={1.9} /> }
export function DropletIcon(props: IconProps) { return <Droplets size={props.size} className={props.className} strokeWidth={1.9} /> }
export function HeartIcon(props: IconProps) { return <Heart size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ZapIcon(props: IconProps) { return <Zap size={props.size} className={props.className} strokeWidth={1.9} /> }
export function SendIcon(props: IconProps) { return <Send size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ScanIcon(props: IconProps) { return <Scan size={props.size} className={props.className} strokeWidth={1.9} /> }
export function TrendingUpIcon(props: IconProps) { return <TrendingUp size={props.size} className={props.className} strokeWidth={1.9} /> }
export function TrendingDownIcon(props: IconProps) { return <TrendingDown size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ClockIcon(props: IconProps) { return <Clock size={props.size} className={props.className} strokeWidth={1.9} /> }
export function StarIcon({ size = 20, className = "", filled = false, fill }: IconProps & { filled?: boolean; fill?: string }) {
  return <Star size={size} className={className} fill={fill ? fill : filled ? "currentColor" : "none"} strokeWidth={1.9} />
}
export function BellIcon(props: IconProps) { return <Bell size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ShoppingCartIcon(props: IconProps) { return <ShoppingCart size={props.size} className={props.className} strokeWidth={1.9} /> }
export function CalendarIcon(props: IconProps) { return <Calendar size={props.size} className={props.className} strokeWidth={1.9} /> }
export function TrashIcon(props: IconProps) { return <Trash2 size={props.size} className={props.className} strokeWidth={1.9} /> }
export function EditIcon(props: IconProps) { return <Pencil size={props.size} className={props.className} strokeWidth={1.9} /> }
export function XIcon(props: IconProps) { return <X size={props.size} className={props.className} strokeWidth={2.2} /> }
export function AlertTriangleIcon(props: IconProps) { return <TriangleAlert size={props.size} className={props.className} strokeWidth={1.9} /> }
export function ScaleIcon(props: IconProps) { return <Scale size={props.size} className={props.className} strokeWidth={1.9} /> }
export function PlayIcon(props: IconProps) { return <Play size={props.size} className={props.className} strokeWidth={1.9} /> }
export function RefreshIcon(props: IconProps) { return <RefreshCw size={props.size} className={props.className} strokeWidth={1.9} /> }
export function CheckIcon(props: IconProps) { return <Check size={props.size} className={props.className} strokeWidth={2.2} /> }
export function UploadIcon(props: IconProps) { return <Upload size={props.size} className={props.className} strokeWidth={1.9} /> }
export function Barcode2Icon(props: IconProps) { return <Barcode size={props.size} className={props.className} strokeWidth={1.9} /> }
export function EyeIcon(props: IconProps) { return <Eye size={props.size} className={props.className} strokeWidth={1.9} /> }
export function EyeOffIcon(props: IconProps) { return <EyeOff size={props.size} className={props.className} strokeWidth={1.9} /> }
