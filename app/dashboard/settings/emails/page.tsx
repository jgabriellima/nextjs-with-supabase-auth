import * as React from 'react'

import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Separator } from '@/components/ui/separator'

import { EmailList } from './email-list'
import { AddEmail } from './components/add-email'
import { EditPrimaryEmail } from './components/edit-primary-email'

export default function EmailsPage() {
  return (
    <main className="flex-1 space-y-16 overflow-auto p-10 pb-16">
      <div className="space-y-4">
        <Title text="EmailsSection.title" translate="yes" />
        <Separator />
        <Description text="EmailsSection.description" translate="yes" />
        <EmailList />
        <AddEmail />
        <Separator />
        <EditPrimaryEmail />
      </div>
    </main>
  )
}
