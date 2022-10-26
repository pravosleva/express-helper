import { useCallback, useState } from 'react'

type TProps = {
  [key: string]: any
}

export const useForm = (initialState = {}): TProps => {
  const [formData, setFormData] = useState<{ [key: string]: any }>(initialState)
  const resetForm = useCallback(() => {
    setFormData(initialState)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.type) {
      case 'checkbox':
        setFormData((oldData) => ({
          ...oldData,
          [e.target.name]: e.target.checked,
        }))
        break
      default:
        setFormData((oldData) => ({
          ...oldData,
          [e.target.name]: e.target.value,
        }))
        break
    }
  }, [setFormData])

  return { formData, handleInputChange, resetForm }
}