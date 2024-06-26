'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { LucideIcon, LucideIconName } from '@/lib/lucide-icon'
import { toast } from 'sonner'
import { Button, ButtonProps } from '@/components/ui/button'

import { useSWRConfig } from 'swr'
import {
  fetcher,
  setQueryString,
  generateRecentPosts,
  getPostPath,
  getProfilePath,
  getFavoritesPath,
} from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { PostAPI } from '@/types/api'
import { useSearchParams } from 'next/navigation'
import { useUserAPI } from '@/queries/client/users'
import { Post } from '@/types/database'

interface AddDummyPostProps
  extends ButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  startIconName?: LucideIconName
  endIconName?: LucideIconName
}

const AddDummyPost = ({
  children,
  text,
  translate,
  startIconName,
  endIconName,
  ...props
}: AddDummyPostProps) => {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { session } = useAuth()
  const { user } = useUserAPI(session?.user?.id ?? null)
  const { mutate } = useSWRConfig()

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  const onClick = async () => {
    try {
      setIsSubmitting(true)

      if (!user) throw new Error('Require is not defined.')

      const posts = generateRecentPosts(user?.id, 1)
      const postPaths = posts?.map((post: Partial<Post>) =>
        getPostPath(post, { username: user?.username })
      )
      const revalidatePaths = [
        ...postPaths,
        getProfilePath(user),
        getFavoritesPath(user),
      ]

      const inserted = await fetcher<PostAPI>(
        `/api/v1/post?userId=${user?.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ data: posts, options: { revalidatePaths } }),
        }
      )

      if (inserted?.error) throw new Error(inserted?.error?.message)

      const countSearchParams = setQueryString({
        userId: user?.id,
        postType: (searchParams.get('postType') as string) ?? 'post',
        q: searchParams.get('q') as string,
      })

      const listSearchParams = setQueryString({
        userId: user?.id,
        page: +((searchParams.get('page') as string) ?? '1'),
        perPage: +((searchParams.get('perPage') as string) ?? '10'),
        postType: (searchParams.get('postType') as string) ?? 'post',
        status: searchParams.get('status') as string,
        q: searchParams.get('q') as string,
        orderBy: (searchParams.get('orderBy') as string) ?? 'id',
        order: (searchParams.get('order') as string) ?? 'desc',
      })

      mutate(`/api/v1/post?userId=${user?.id}`)
      mutate(`/api/v1/post/count?${countSearchParams}`)
      mutate(`/api/v1/post/list?${listSearchParams}`)
    } catch (e: unknown) {
      const err = (e as Error)?.message
      if (err.startsWith('Payment Required')) {
        toast.error(t('402.statusText', { ns: 'httpstatuscode' }))
      } else {
        toast.error((e as Error)?.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button type="button" onClick={onClick} disabled={isSubmitting} {...props}>
      {startIconName && (
        <LucideIcon name={startIconName} className="mr-2 size-4" />
      )}
      {text && translate === 'yes' ? t(text) : text}
      {children}
      {endIconName && <LucideIcon name={endIconName} className="ml-2 size-4" />}
    </Button>
  )
}

export { AddDummyPost, type AddDummyPostProps }
