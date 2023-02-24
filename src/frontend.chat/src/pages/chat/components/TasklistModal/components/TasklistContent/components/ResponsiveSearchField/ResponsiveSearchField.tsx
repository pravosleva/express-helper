import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import {
  Input,
  useColorMode,
  Grid,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
  useToast,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { IoMdClose } from 'react-icons/io'
import { useDebounce as useDebouncedValue } from '~/common/hooks/useDebounce'
import { AiOutlinePlus } from 'react-icons/ai'
import { useSocketContext } from '~/context/socketContext'
import { useMainContext } from '~/context/mainContext'

type TProps = {
  initialState: string;
  onChange: (e: any) => void;
  onClear: (e?: any) => void;
  isCreateNewDisabled: boolean
}

export const ResponsiveSearchField = ({
  initialState,
  onChange,
  onClear,
  isCreateNewDisabled,
}: TProps) => {
  const [state, setState] = useState<string>(initialState)
  const handleClear = useCallback(() => {
    setState('')
    onClear()
  }, [setState, onClear])
  const debouncedSearchText = useDebouncedValue(state, 200)
  useEffect(() => {
    onChange({ target: { value: debouncedSearchText } })
  }, [debouncedSearchText, onChange])
  const mode = useColorMode()

  const { socket } = useSocketContext()
  const { room } = useMainContext()
  const toast = useToast()
  const handleCreateNew = useCallback(() => {
    if (!!socket) socket?.emit('createTask', { room, title: state }, (errMsg?: string) => {
      if (!!errMsg) toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      else handleClear()
    })
  }, [state, room, handleClear, toast])

  return (
    <div style={{ width: '100%' }}>
      <Grid
        mt={1}
        templateColumns={!!state ? '2fr auto' : '1fr'}
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
        {!!state && <IconButton
          size='sm'
          aria-label="ADD"
          colorScheme='green'
          variant='outline'
          isRound
          icon={<AiOutlinePlus size={15} />}
          onClick={handleCreateNew}
          isDisabled={isCreateNewDisabled}
        >
          ADD
        </IconButton>}
      </Grid>
    </div>
  )
}
