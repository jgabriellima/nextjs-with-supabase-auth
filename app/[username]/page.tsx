import * as React from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'

import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Paging, PagingProvider } from '@/components/paging'
import { Aside } from './aside'

import { LucideIcon } from '@/lib/lucide-icon'
import { cn, getAuthorUrl, getFavoritesUrl, getPostUrl } from '@/lib/utils'
import { getUserAPI } from '@/queries/server/users'
import { getPostsAPI } from '@/queries/server/posts'
import { siteConfig } from '@/config/site'
import { Post, User } from '@/types/database'

// revalidate the data at most every week
// 3600 (hour), 86400 (day), 604800 (week), 2678400 (month), 31536000 (year)
export const revalidate = 0

export async function generateMetadata(
  {
    params: { username },
  }: {
    params: { username: string }
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { user } = await getUserAPI(null, { username })

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: user?.full_name,
    description: user?.bio,
    openGraph: {
      title: user?.full_name ?? undefined,
      description: user?.bio ?? undefined,
      images: user?.avatar_url ?? undefined,
    },
  }
}

export default async function UserPage({
  params: { username },
  searchParams,
}: {
  params: { username: string }
  searchParams?: {
    page?: string
    perPage?: string
    pageSize?: string
    q?: string
    orderBy?: string
    order?: string
  }
}) {
  const { user } = await getUserAPI(null, { username })

  if (!user) notFound()

  const page = +(searchParams?.page ?? '1')
  const perPage = +(searchParams?.perPage ?? '10')
  const pageSize = +(searchParams?.pageSize ?? '10')
  const q = searchParams?.q
  const orderBy = searchParams?.orderBy ?? 'id'
  const order = searchParams?.order ?? 'desc'

  const { posts, count } = await getPostsAPI(user?.id ?? null, {
    page,
    perPage,
    postType: 'post',
    status: 'publish',
    q,
    orderBy,
    order,
  })

  const total = count ?? 0

  return (
    <>
      <Header />
      <main
        className={cn(
          'min-h-[80vh] pb-40',
          siteConfig?.fixedHeader ? 'pt-[61px]' : ''
        )}
      >
        <div className="container flex-1 overflow-auto pt-12">
          <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-4 lg:gap-[60px]">
            <div className="relative flex flex-col gap-4">
              <Aside user={user} />
            </div>
            <div className="flex flex-col md:col-span-2 lg:col-span-3">
              <div className="flex w-full flex-col-reverse justify-between sm:flex-row sm:items-end">
                <div className="hidden sm:inline">Recent generations</div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <RecentLink user={user} />
                  <FavoritesLink user={user} />
                </div>
              </div>
              <Separator className="my-4" />
              <PagingProvider value={{ total, page, perPage, pageSize }}>
                <div className="space-y-16">
                  {Array.isArray(posts) && posts?.length > 0 ? (
                    <>
                      <PostList posts={posts} />
                      <Paging />
                    </>
                  ) : (
                    <EmptyList />
                  )}
                </div>
              </PagingProvider>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

interface TabLinkProps {
  user: User
}

const RecentLink = ({ user }: TabLinkProps) => {
  return (
    <Link
      href="#"
      scroll={!siteConfig?.fixedHeader}
      className="flex w-full items-center sm:w-auto"
    >
      <LucideIcon name="History" className="mr-1 size-4 min-w-4" />
      Recent
    </Link>
  )
}

const FavoritesLink = ({ user }: TabLinkProps) => {
  return (
    <Link
      href={getFavoritesUrl(user) ?? '#'}
      scroll={!siteConfig?.fixedHeader}
      className="flex w-full items-center text-muted-foreground sm:w-auto"
    >
      <LucideIcon
        name="Heart"
        fill="transparent"
        className="mr-1 size-4 min-w-4 text-destructive"
      />
      Favorites
    </Link>
  )
}

interface PostListProps extends React.HTMLAttributes<HTMLDivElement> {
  posts: Post[]
}

const PostList = ({ posts, ...props }: PostListProps) => {
  return (
    <div className="grid grid-cols-1 gap-8" {...props}>
      {posts?.map((post: Post) => <PostItem key={post?.id} post={post} />)}
    </div>
  )
}

const EmptyList = () => {
  return <div>No posts yet</div>
}

interface PostItemProps extends React.HTMLAttributes<HTMLDivElement> {
  post: Post
}

const PostItem = ({ post, ...props }: PostItemProps) => {
  return (
    <div className="space-y-2" {...props}>
      <h3 className="line-clamp-2 font-serif text-3xl hover:underline">
        <Link href={getPostUrl(post) ?? '#'} scroll={!siteConfig?.fixedHeader}>
          {post?.title}
        </Link>
      </h3>
      <p className="line-clamp-3">{post?.excerpt}</p>
      <div className="space-x-1 text-sm">
        <time dateTime={post?.date ?? undefined}>
          {dayjs(post?.date).format('MMMM D, YYYY')}
        </time>
        <span>— by</span>
        <Link
          href={getAuthorUrl(post) ?? '#'}
          scroll={!siteConfig?.fixedHeader}
          className="hover:underline"
        >
          {post?.author?.full_name ?? post?.author?.username}
        </Link>
      </div>
    </div>
  )
}
