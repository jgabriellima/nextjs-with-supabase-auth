'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { AccountMenu } from '@/components/account-menu'

import { Notify } from '../notify'
import { useAppBar } from './app-bar-provider'

interface AppBarProps extends React.HTMLAttributes<HTMLElement> {}

const AppBar = ({ children, className, ...props }: AppBarProps) => {
  const { height } = useAppBar()

  return (
    <header
      className={cn(
        'flex w-full items-center gap-4 border-b bg-background px-6',
        height,
        className
      )}
      {...props}
    >
      {children}
      <div className="flex-1 text-destructive"></div>
      <Notify />
      <AccountMenu />
    </header>
  )
}

export { AppBar, type AppBarProps }
