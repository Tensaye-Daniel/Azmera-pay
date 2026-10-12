import { useState, type InputHTMLAttributes } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'
import TextInput from './TextInput'

export default function PasswordInput({
  autoComplete = 'new-password',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)

  return (
    <TextInput
      {...props}
      autoComplete={autoComplete}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="grid size-8 place-items-center rounded-lg text-stone transition-colors hover:bg-forest/10 hover:text-forest-deeper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          {visible ? (
            <EyeOffIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
        </button>
      }
    />
  )
}
