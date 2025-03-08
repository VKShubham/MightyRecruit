import React from 'react'

const ScreenLoader: React.FC = () => {
  return (
    <div>
        <div className="h-screen w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
    </div>
  )
}

export default ScreenLoader