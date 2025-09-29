import React from 'react'

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
    {message}
  </div>
)
