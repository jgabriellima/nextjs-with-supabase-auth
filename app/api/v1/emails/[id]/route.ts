import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/supabase/auth'

export async function GET(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const response = await supabase.from('emails').select().eq('user_id', id)

    if (response?.error) throw new Error(response?.error?.message)

    return NextResponse.json({ data: response?.data, error: null })
  } catch (e: unknown) {
    return NextResponse.json(
      { data: null, error: { message: (e as Error)?.message } },
      { status: 400 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const { authenticated, user } = await authenticate()

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (!authenticated) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (user?.id !== id) {
    return NextResponse.json(
      { data: null, error: { message: 'Forbidden' } },
      { status: 403 }
    )
  }

  try {
    const data = await request.json()
    const supabase = createClient()
    const response = await supabase
      .from('emails')
      .update(data)
      .eq('user_id', id)

    if (response?.error) throw new Error(response?.error?.message)

    return NextResponse.json({ data: null, error: null })
  } catch (e: unknown) {
    return NextResponse.json(
      { data: null, error: { message: (e as Error)?.message } },
      { status: 400 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const { authenticated, user } = await authenticate()

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (!authenticated) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (user?.id !== id) {
    return NextResponse.json(
      { data: null, error: { message: 'Forbidden' } },
      { status: 403 }
    )
  }

  try {
    const data = await request.json()
    const supabase = createClient()
    const response = await supabase.from('emails').insert(data)

    if (response?.error) throw new Error(response?.error?.message)

    return NextResponse.json({ data: null, error: null })
  } catch (e: unknown) {
    return NextResponse.json(
      { data: null, error: { message: (e as Error)?.message } },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const { authenticated, user } = await authenticate()

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (!authenticated) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  // This is not required if using RLS(Row Level Security) with Supabase Auth.
  if (user?.id !== id) {
    return NextResponse.json(
      { data: null, error: { message: 'Forbidden' } },
      { status: 403 }
    )
  }

  try {
    const data = await request.json()
    const supabase = createClient()
    const response = await supabase
      .from('emails')
      .delete()
      .eq('user_id', id)
      .eq('email', data?.email)

    if (response?.error) throw new Error(response?.error?.message)

    return NextResponse.json({ data: null, error: null })
  } catch (e: unknown) {
    return NextResponse.json(
      { data: null, error: { message: (e as Error)?.message } },
      { status: 400 }
    )
  }
}