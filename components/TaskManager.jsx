'use client'

import { Button } from "@/components/ui/button"
import {
  Field,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { supabase } from '@/components/supabase-client'
import { toast } from "sonner"

const TaskManager = ({session}) => {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  })

  const [newDescription, setNewDescription] = useState("")

  const [tasks, setTasks] = useState([])

  const fetchTasks = async () => {
    const { error, data } = await supabase.from('tasks').select("*").order("created_at", { ascending: true })

    if (error) {
      toast.error("Unable to fetch tasks")
      return
    }

    setTasks(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error, data } = await supabase.from('tasks').insert({ ...newTask, email: session.user.email }).select().single()

    if (error) {
      toast.error("Unable to add task")
    }

    toast.success("Task added successfully")

    // setTasks((prev) => [...prev, data])

    setNewTask({ title: "", description: "" })
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq("id", id)

    if (error) {
      toast.error("Unable to delete task")
    }

    toast.success("Task deleted")
  }

  const updateTask = async (id) => {
    const { error } = await supabase.from('tasks').update({ description: newDescription }).eq("id", id)

    if (error) {
      toast.error("Unable to update description")
    }

    toast.success("Description updated!")
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
  const channel = supabase
    .channel('tasks-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => {
        const newTask = payload.new
        setTasks((prev) => [...prev, newTask])
      }
    )

  // subscribe returns a promise
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Subscribed!')
    }
  })

  // cleanup on unmount
  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  const logout = async () => {
     const {error} =await supabase.auth.signOut()
  
     if(error) {
      toast.error("Unable to logout")
      return
     }
  
     toast.success("You are logged out")
    }

  return (
    <div className='min-h-screen w-screen flex flex-col items-center justify-center font-mono text-neutral-900 bg-neutral-100 py-10'>
        <Button onClick={logout} className="mb-3 cursor-pointer" size={"sm"}>Logout</Button>
      <div className="pb-10">Task Manager</div>
      <div>
        <form onSubmit={handleSubmit} className="md:w-lg w-sm space-y-3">
          <Field>
            <Input id="title" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))} />
          </Field>
          <Field>
            <Textarea id="description" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))} />
          </Field>
          <Button className="w-full">Add Task</Button>
        </form>
      </div>

      {/* tasks */}
      <div className="space-y-5 pt-10">
        <div className="text-sm">Your Tasks</div>
        {tasks.map((task, key) =>
          <div key={key} className="space-y-3 border border-black md:w-lg w-sm p-4">
            <div className="space-y-1">
              <div>{task.title}</div>
              <div className="text-neutral-500 text-sm">{task.description}</div>
            </div>
            <div>
              <Field>
                <Textarea placeholder="Updated description" onChange={(e) => setNewDescription(e.target.value)} />
              </Field>
            </div>
            <div className="space-x-2">
              <Button variant={'outline'} className="text-xs cursor-pointer" onClick={() => updateTask(task.id)}>Edit</Button>
              <Button variant={'destructive'} className="text-xs cursor-pointer" onClick={() => deleteTask(task.id)}>Delete</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskManager