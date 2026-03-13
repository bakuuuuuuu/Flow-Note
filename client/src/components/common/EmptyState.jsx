import Button from './Button'

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
      {icon && <div className="text-6xl">{icon}</div>}
      <div className="text-center">
        <p className="text-lg font-semibold text-[#2d3436] dark:text-[#f5f5f5]">{title}</p>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

export default EmptyState