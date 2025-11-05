'use client'
import TaskManager from '@/components/TaskManager'
import {Auth} from '@/components/Auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/components/supabase-client'

const page = () => {
  const [session, setSession] = useState(null)

  const fetchSession = async () => {
     const currentSession = await supabase.auth.getSession()
     setSession(currentSession.data.session)
  }

  useEffect(() => {
    fetchSession()
  },[])

  return (
    <div>
      {session ? 
        <TaskManager />
      : 
      <Auth />
      }
    </div>
  )
}

export default page