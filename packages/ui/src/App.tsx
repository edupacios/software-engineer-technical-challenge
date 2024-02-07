import Delete from '@mui/icons-material/Delete'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import IconButton from '@mui/joy/IconButton'
import List from '@mui/joy/List'
import ListDivider from '@mui/joy/ListDivider'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import { Task } from '@prisma/client'
import { Fragment, useEffect, useState } from 'react'
import { z } from 'zod'
import {ListItem} from "@mui/joy";

const TaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch('http://localhost:1984/tasks', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        return res.json()
      })
      .then(data => {
        // TO-DO: How to guarantee that data is an array of Task?
        setTasks(data as Task[])
      })
  }, [])

  const handleCreateTask = () => {
    const task = {
      title: prompt(),
    }

    fetch(`http://localhost:1984/tasks`, {
      method: 'post',
      body: JSON.stringify(task),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        return TaskSchema.parse(await res.json())
      })
      .then((task: Task): void => {
        setTasks([...tasks, task])
      })
  }

  const handleUpdateTask = (task: Task, completed: Task['completed']) => {
    fetch(`http://localhost:1984/tasks/${task.id}`, {
      method: 'put',
      body: JSON.stringify({ ...task, completed }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        return TaskSchema.parse(await res.json())
      })
      .then((task: Task): void => {
        setTasks(tasks.map(t => (t.id === task.id ? { ...t, completed } : t)))
      })
  }

  const handleDeleteTask = (task: Task) => {
    fetch(`http://localhost:1984/tasks/${task.id}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        return TaskSchema.parse(await res.json())
      })
      .then((task: Task): void => {
        setTasks([...tasks.filter((t: Task) => t.id !== task.id)])
      })
  }

  return (
    <Stack
      gap={2}
      style={{
        maxWidth: 500,
        margin: 'auto',
        alignItems: 'center',
      }}>
      <Typography color='primary' level='h1'>
        Task List
      </Typography>
      <List
        variant='outlined'
        sx={{
          borderRadius: 'sm',
          width: '100%',
        }}>

        { tasks.map((task: Task, index: number) => (
          <Fragment key={task.id}>
            {index > 0 && <ListDivider />}
            <ListItem
              key={task.id}
              endAction={
                <IconButton
                  aria-label='Delete'
                  size='sm'
                  color='danger'
                  onClick={() => handleDeleteTask(task)}>
                  <Delete />
                </IconButton>
              }>
              <Checkbox
                label={task.title}
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
                checked={task.completed}
                onChange={event => handleUpdateTask(task, event.target.checked)}
              />
            </ListItem>
          </Fragment>
        ))}
      </List>
      <Button fullWidth onClick={() => handleCreateTask()}>
        New Task
      </Button>
    </Stack>
  )
}
