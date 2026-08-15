'use client'

import { useRouter } from 'next/navigation'

export function ProjectPicker({
  projects,
  selectedId,
  queryName = 'project',
  path,
}: {
  projects: { id: string; name: string }[]
  selectedId: string
  queryName?: string
  path: string
}) {
  const router = useRouter()
  return (
    <div className="mb-6 max-w-sm">
      <label className="mb-1 block text-[13px] text-[var(--color-muted)]" htmlFor="project-picker">
        Project
      </label>
      <select
        id="project-picker"
        className="field"
        value={selectedId}
        onChange={(e) => router.push(`${path}?${queryName}=${e.target.value}`)}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}
