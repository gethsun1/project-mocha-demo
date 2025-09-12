'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
}

export function Toast({ toast, onClose }: { toast: ToastProps; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    if (toast.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const coffeeColors = {
    success: 'bg-coffee-light/10 border-coffee-light text-coffee-espresso',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-coffee-light/20 border-coffee-medium text-coffee-espresso',
    info: 'bg-coffee-light/10 border-coffee-light text-coffee-espresso'
  }

  const Icon = icons[toast.type || 'info']

  return (
    <div
      className={cn(
        'coffee-transition transform transition-all duration-300 ease-in-out',
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95',
        'max-w-sm w-full coffee-shadow-lg rounded-lg border p-4 coffee-hover',
        toast.type === 'success' ? coffeeColors.success : 
        toast.type === 'error' ? colors.error :
        toast.type === 'warning' ? coffeeColors.warning :
        coffeeColors.info
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn(
            'h-5 w-5',
            toast.type === 'success' ? 'text-coffee-medium' :
            toast.type === 'error' ? 'text-red-600' :
            toast.type === 'warning' ? 'text-coffee-medium' :
            'text-coffee-medium'
          )} />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 coffee-focus"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, description?: string) => 
      addToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) => 
      addToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) => 
      addToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) => 
      addToast({ title, description, type: 'info' })
  }
}
