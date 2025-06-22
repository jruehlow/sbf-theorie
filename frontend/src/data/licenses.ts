import { IoBoatOutline } from "react-icons/io5";

export interface License {
  id: string
  name: string
  desc: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export const licenses: License[] = [
  {
    id: 'sbf-binnen',
    name: 'SBF-Binnen',
    desc: 'Für Binnengewässer',
    icon: IoBoatOutline
  },
  {
    id: 'sbf-see',
    name: 'SBF-See',
    desc: 'Für Küstengewässer',
    icon: IoBoatOutline
  }
]
