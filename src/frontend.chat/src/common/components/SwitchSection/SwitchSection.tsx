import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Switch } from '@chakra-ui/react'

type TProps = {
  onChange: (e: any) => void
  isChecked: boolean
  description: string | React.FC<{ isDescriptionOpened: boolean }>
  id: string
  label: string
}

export const SwitchSection = ({ isChecked, onChange, description, id, label }: TProps) => {
  const [isDescriptionOpened, setIsDescriptionOpened] = useState<boolean>(false)
  const toggleDescr = () => {
    setIsDescriptionOpened((s) => !s)
  }

  return (
    <>
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        <FormControl display='flex' alignItems='center'>
          <Switch id={id} mr={3} onChange={onChange} isChecked={isChecked} />
          <FormLabel htmlFor={id} mb='0'>
            {label}
          </FormLabel>
        </FormControl>
        <Box style={{ marginLeft: 'auto' }}>
          <Button size='sm' variant='link' onClick={toggleDescr} rounded='3xl'>{isDescriptionOpened ? 'Close' : 'What is it?'}</Button>
        </Box>
      </Box>
      {
        isDescriptionOpened && (
          <Box>{typeof description === 'string' ? description : description({ isDescriptionOpened })}</Box>
        )
      }
    </>
  )
}

/*
<SwitchSection
  onChange={toggleDevtoolsFeature}
  isChecked={devtoolsFeatureSnap.isFeatureEnabled}
  description='Эта фича позволит настроить доп. опции прозводительности, посмотреть аналитику потребления, возможно, что-то еще'
/>
*/