import { useState, useCallback, useMemo, memo, useEffect } from 'react'

import {
  Input,
  useColorMode,
  Grid,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { IoMdClose } from 'react-icons/io'
// import { HiChevronUp } from 'react-icons/hi'
import { useDebounce as useDebouncedValue } from '~/common/hooks/useDebounce'

type TProps = {
  initialState: string;
  onChange: (e: any) => void;
  onClear: (e?: any) => void;
}

export const ResponsiveSearchField = ({
  initialState,
  onChange,
  onClear,
}: TProps) => {
  const [state, setState] = useState<string>(initialState)
  const handleClear = useCallback(() => {
    setState('')
    onClear()
  }, [setState, onClear])
  const debouncedSearchText = useDebouncedValue(state, 1000)
  useEffect(() => {
    onChange({ target: { value: debouncedSearchText } })
  }, [debouncedSearchText, onChange])
  const mode = useColorMode()
  return (
    <div
      style={{
        width: '100%',
        // border: '1px solid red',
      }}
    >
      <Grid
        mt={1}
        templateColumns='1fr'
        gap={2}
        alignItems='center'
      >
        <InputGroup
          justifySelf='stretch'
        >
          <InputLeftElement
            pointerEvents="none"
            color="gray.300"
            fontSize="1.0em"
            children={<FiSearch color={mode.colorMode === 'light' ? '#FFF' : 'inherit'} />}
          />
          <Input
            // ref={inputRef}
            name='searchText'
            type='text'
            placeholder="Search"
            value={state}
            onChange={(e) => {
              setState(e.target.value)
            }}
            rounded='3xl'
            size='md'
            variant='outline'
            style={{
              caretColor: mode.colorMode === 'light' ? 'var(--chakra-colors-red-600)' : 'var(--chakra-colors-red-200)',
              color: mode.colorMode === 'light' ? 'var(--chakra-colors-red-600)' : 'var(--chakra-colors-red-200)',
              fontWeight: 'bold',
            }}
          />
          {
            !!state && (
              <InputRightElement>
                <IconButton
                  size='xs'
                  aria-label="DEL"
                  colorScheme='red'
                  variant='outline'
                  isRound
                  icon={<IoMdClose size={15} />}
                  onClick={handleClear}
                  isDisabled={!state}
                >
                  DEL
                </IconButton>
              </InputRightElement>
            )
          }
        </InputGroup>
        {/* <IconButton
          size='sm'
          aria-label="DEL"
          colorScheme='gray'
          variant='outline'
          isRound
          icon={<HiChevronUp size={15} />}
          onClick={handleClose}
        >
          DEL
        </IconButton> */}
      </Grid>
    </div>
  )
}
