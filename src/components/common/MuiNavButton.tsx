interface MuiNavButtonProps {
  label: string
  icon?: React.ReactNode
  endIcon?: React.ReactNode
  className?: string
  onClick?: () => void
  activeColor?: string
  isActive?: boolean
}

export const MuiNavButton: React.FC<MuiNavButtonProps> = ({ 
  label, 
  icon,
  endIcon,
  onClick, 
  className = '',
  activeColor,
  isActive = false
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        inline-flex items-center gap-2 whitespace-nowrap outline-none focus:outline-none
        ${className}
        ${isActive ? ` ${activeColor}` : ''}
      `}
    >
      {icon && <span className={`${isActive ? activeColor : ''}`}>
        {icon}
      </span>}
      <span className={`${isActive ? activeColor : ''}`}>{label}</span>
      {endIcon && <span className={`${isActive ? activeColor : ''} ml-auto`}>
        {endIcon}
      </span>}
    </button>
  );
};