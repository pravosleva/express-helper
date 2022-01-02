import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, IconButton, Switch } from '@chakra-ui/react'
import { IoMdClose } from 'react-icons/io'
import { AiOutlineQuestion } from 'react-icons/ai'

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
          <IconButton
            size='xs'
            aria-label="Close"
            colorScheme='gray'
            variant='outline'
            isRound
            icon={isDescriptionOpened ? <IoMdClose size={15} /> : <AiOutlineQuestion size={15} />}
            onClick={toggleDescr}
          >
            DEL
          </IconButton>
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