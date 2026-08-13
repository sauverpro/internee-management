const palette = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export default function Avatar({ name = '', size = 'md' }) {
  const color = palette[(name.charCodeAt(0) || 0) % palette.length]
  return (
    <div
      className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none`}
    >
      {getInitials(name)}
    </div>
  )
}
