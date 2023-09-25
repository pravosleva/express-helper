import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import {
  Input,
  useColorMode,
  Grid,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
  useToast,
  Button,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { IoMdClose } from 'react-icons/io'
import { useDebounce as useDebouncedValue } from '~/common/hooks/useDebounce'
import { AiOutlinePlus } from 'react-icons/ai'
import { useSocketContext } from '~/context/socketContext'
import { useMainContext } from '~/context/mainContext'
import { useCompare } from '~/common/hooks/useDeepEffect'
import { getTagList } from '~/utils/strings-ops/getTagList'

type TTask = {
  ts: number;
  editTs?: number;
  title: string;
  isCompleted: boolean;
}
type TProps = {
  data: TTask[];
  initialState: string;
  onChange: (e: any) => void;
  onClear: (e?: any) => void;
  isCreateNewDisabled: boolean
}
// const getHashTags = (data: TTask[]) => {
//   const abSort = (a: string, b: string) => a.localeCompare(b)
//   const latinRe = /[^a-zA-Z]/gi
//   const cyrillicRe = /[^а-яА-Я]/gi
//   const numsRe = /[^0-9]/gi
//   const res = data.reduce((acc: string[], cur: TTask) => {
//     if (!cur.title) return acc
//     const words = cur.title.replace(/\n/g, ' ').split(' ').filter((w) => latinRe.test(w) || cyrillicRe.test(w) || numsRe.test(w))
//     for (const word of words) if (!!word && word[0] === '#') acc.push(word)
//     return acc
//   }, [])

//   // TODO: a-zA-Zа-яА-Я0-9

//   return [...new Set(res)].sort(abSort)
// }

const defaultTagsLimit: number = 5
export const ResponsiveSearchField = ({
  data,
  initialState,
  onChange,
  onClear,
  isCreateNewDisabled,
}: TProps) => {
  // const tagList = useMemo<string[]>(() => getHashTags(data), [useCompare(data)])
  const tagList: string[] = useMemo(() => getTagList({
    originalMsgList: data.map(({ title }) => title)
  }).sortedList, [useCompare(data)])
  const extendetTagsInfo: {
    [key: string]: {
      name: string;
      counter: number;
    }
  } = useMemo(() => getTagList({
    originalMsgList: data.map(({ title }) => title)
  }).extended, [useCompare(data)])
  const [isShowMoreEnabled, setIsShowMoreEnabled] = useState(false)
  const [enabledTags, setEnabledTags] = useState<string[]>([])
  const enabledTagsRef = useRef<Set<string>>(new Set())

  const [state, setState] = useState<string>(initialState)
  const handleClear = useCallback(() => {
    setState('')
    setEnabledTags([])
    enabledTagsRef.current.clear()
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
  }, [state, room, handleClear, toast, socket])

  const toggleTag = useCallback((tag) => {
    if (enabledTagsRef.current.has(tag)) enabledTagsRef.current.delete(tag)
    else enabledTagsRef.current.add(tag)

    setEnabledTags(Array.from(enabledTagsRef.current))
  }, [setEnabledTags])
  const checkIsTagEnabled = useCallback((tag) => enabledTags.includes(tag), [enabledTags])

  useEffect(() => {
    if (enabledTags.length > 0) setState(enabledTags.join(' '))
    else setState('')
  }, [enabledTags, setState])

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
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
                  aria-label="ADD"
                  colorScheme='green'
                  variant='outline'
                  isRound
                  icon={<AiOutlinePlus size={15} />}
                  onClick={handleCreateNew}
                  isDisabled={isCreateNewDisabled}
                >
                  ADD
                </IconButton>
              </InputRightElement>
            )
          }
        </InputGroup>
        {!!state && (
          <IconButton
            size='md'
            aria-label="DEL"
            colorScheme='red'
            variant='solid'
            isRound
            icon={<IoMdClose size={18} />}
            onClick={handleClear}
            isDisabled={!state}
          >
            DEL
          </IconButton>
        )}
      </Grid>
      {
        tagList.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 'var(--chakra-space-2)',
              paddingTop: 'var(--chakra-space-2)',
              paddingBottom: 'var(--chakra-space-2)',
              // maxHeight: '105px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {tagList.map((tag, i) => {
              const isEnabled = checkIsTagEnabled(tag)
              const isHidden = isShowMoreEnabled ? false : i > defaultTagsLimit - 1
              if (isHidden) return null
              return (
                <Button
                  key={`${tag}_${String(isEnabled)}`}
                  size='sm'
                  colorScheme={isEnabled ? 'blue' : 'gray'}
                  variant={isEnabled ? 'solid' : 'ghost'}
                  // leftIcon={<FcGallery color='#FFF' size={18} />}
                  onClick={() => {
                    toggleTag(tag)
                  }}
                  // mr={2}
                  rounded='3xl'
                  rightIcon={<div style={{
                    border: 'var(--chakra-borders-2px) var(--chakra-colors-red-600)',
                    padding: 'var(--chakra-space-1)',
                    minWidth: 'var(--chakra-space-8)',
                    borderRadius: 'var(--chakra-radii-3xl)',
                  }}>{extendetTagsInfo[tag].counter}</div>}
                >
                  {tag}
                </Button>
              )
            })}
            {
              tagList.length > defaultTagsLimit ? (
                <>
                  {!isShowMoreEnabled ? (
                    <Button
                      size='sm'
                      colorScheme='blue'
                      variant='link' 
                      // leftIcon={<FcGallery color='#FFF' size={18} />}
                      onClick={() => {
                        setIsShowMoreEnabled(true)
                      }}
                      // mr={2}
                      // rounded='3xl'
                    >
                      Show more
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      colorScheme='blue'
                      variant='link' 
                      // leftIcon={<FcGallery color='#FFF' size={18} />}
                      onClick={() => {
                        setIsShowMoreEnabled(false)
                      }}
                      // mr={2}
                      // rounded='3xl'
                    >
                      Collapse
                    </Button>
                  )}
                </>
              ) : null
            }
          </div>
        )
      }
    </div>
  )
}
