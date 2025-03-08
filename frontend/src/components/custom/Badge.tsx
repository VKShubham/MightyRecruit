import { Tag } from 'lucide-react';

type BadgeProps = {
  name: string;
  color: string;
  variant?: 'outline' | 'primary';
  className?: string;
};

const Badge = ({ name, color, variant = 'primary', className = '' }: BadgeProps) => {
  if (variant === 'outline') {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border-2 w-fit ${className}`} style={{ borderColor: color }}>
        <Tag className="w-4 h-4" style={{ color }} />
        <span style={{ color }}>
          {name}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      <Tag className="w-4 h-4" />
      <span>{name}</span>
    </div>
  );
};

export default Badge;