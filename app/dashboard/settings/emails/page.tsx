import * as React from 'react'

import { ChangeEmailForm } from './change-email-form'

export default function EmailsPage() {
  return (
    <main className="flex-1 overflow-auto p-10 pb-16">
      <div className="space-y-16">
        <ChangeEmailForm />
      </div>
    </main>
  )
}
