(function() {
const cn = (...inputs) => {
  const classes = []
  inputs.flat(Infinity).forEach((input) => {
    if (!input) return
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input))
    } else if (typeof input === 'object') {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key)
      })
    }
  })
  return classes.join(' ')
}

const Button = ({ variant = 'default', size = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-900'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

const Card = ({ className = '', ...props }) => (
  <div className={cn('rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm', className)} {...props} />
)
const CardHeader = ({ className = '', ...props }) => (
  <div className={cn('space-y-1.5 p-6', className)} {...props} />
)
const CardTitle = ({ className = '', ...props }) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
)
const CardContent = ({ className = '', ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
)

const Alert = ({ className = '', ...props }) => (
  <div
    role="alert"
    className={cn('relative w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700', className)}
    {...props}
  />
)
const AlertDescription = ({ className = '', ...props }) => (
  <p className={cn('text-sm leading-relaxed', className)} {...props} />
)

const Badge = ({ variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-slate-300 text-slate-700',
    secondary: 'bg-slate-100 text-slate-700'
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)} {...props} />
  )
}

const Checkbox = ({ onCheckedChange, className = '', ...props }) => (
  <input
    type="checkbox"
    className={cn('h-4 w-4 rounded border border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-1', className)}
    onChange={(event) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }}
    {...props}
  />
)

const Switch = ({ checked = false, onCheckedChange, className = '', ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => {
      if (onCheckedChange) {
        onCheckedChange(!checked)
      }
    }}
    className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      checked ? 'bg-blue-600' : 'bg-slate-300',
      className
    )}
    {...props}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
)

const Input = ({ className = '', ...props }) => (
  <input
    className={cn(
      'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
)

const Label = ({ className = '', ...props }) => (
  <label className={cn('text-sm font-medium text-slate-700 leading-none', className)} {...props} />
)

const Table = ({ className = '', ...props }) => (
  <table className={cn('w-full caption-bottom text-sm text-left text-slate-700', className)} {...props} />
)
const TableHeader = ({ className = '', ...props }) => (
  <thead className={cn('bg-slate-100 text-xs uppercase tracking-wide text-slate-600', className)} {...props} />
)
const TableBody = ({ className = '', ...props }) => (
  <tbody className={cn('divide-y divide-slate-200', className)} {...props} />
)
const TableRow = ({ className = '', ...props }) => (
  <tr className={cn('transition-colors hover:bg-slate-50', className)} {...props} />
)
const TableHead = ({ className = '', ...props }) => (
  <th className={cn('px-4 py-3 text-left font-medium', className)} {...props} />
)
const TableCell = ({ className = '', ...props }) => (
  <td className={cn('px-4 py-3 align-top', className)} {...props} />
)

const Select = ({ value, defaultValue, onValueChange, options = [], placeholder, className = '', ...props }) => (
  <select
    value={value}
    defaultValue={value === undefined ? defaultValue : undefined}
    onChange={(event) => {
      if (onValueChange) {
        onValueChange(event.target.value)
      }
    }}
    className={cn(
      'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  >
    {placeholder && (value === undefined || value === '') && (
      <option value="" disabled hidden>
        {placeholder}
      </option>
    )}
    {options.map((option) => (
      <option key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    ))}
  </select>
)

const Icon = ({ symbol, className = '' }) => (
  <span className={cn('inline-flex items-center justify-center', className)} aria-hidden="true">{symbol}</span>
)

window.UI = {
  cn,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
  Badge,
  Checkbox,
  Switch,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Icon
}
})();
