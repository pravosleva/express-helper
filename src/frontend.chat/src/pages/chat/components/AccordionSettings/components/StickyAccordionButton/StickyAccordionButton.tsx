import {
  memo,
  // useMemo,
} from 'react'
import {
  AccordionButton,
  // useColorMode,
} from '@chakra-ui/react'

type TProps = {
  children: React.ReactNode;
}

export const StickyAccordionButton = memo(({ children }: TProps) => {
  // const mode = useColorMode()
  // const bgColor = useMemo(() => mode.colorMode === 'dark' ? 'var(--chakra-colors-gray-700)' : 'var(--chakra-colors-whiteAlpha-900)', [mode.colorMode])

  return (
    <AccordionButton
      sx={{
        _focus: {
          boxShadow: 'none',
        },
      }}
      style={{
        position: 'sticky',
        top: '0px',
        // backgroundColor: bgColor,
        zIndex: 1,
      }}
      className='backdrop-blur--transparent'
    >
      {children}
    </AccordionButton>
  )
})
