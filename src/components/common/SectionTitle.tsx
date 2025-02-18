import { useTheme } from '../../context/ThemeContext'

interface SectionTitleProps {
  title: string
  description?: string
}

export const SectionTitle = ({ title, description }: SectionTitleProps) => {
  const { isDarkMode } = useTheme()

  return (
    <div className="mb-8 text-left">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {description && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
    </div>
  )
} 