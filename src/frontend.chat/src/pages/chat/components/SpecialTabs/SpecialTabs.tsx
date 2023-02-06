import { memo } from 'react'
import {
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react"

type TProps = {
  taskId?: string
}

export const SpecialTabs = memo(({
  taskId
}: TProps) => {
  return (
    <Tabs
      // isFitted
      variant='soft-rounded'
      colorScheme='gray'
      defaultIndex={1}
    >
      <TabList mb='1em'>
        <Tab isDisabled={!taskId}>Discussion</Tab>
        <Tab>Room news</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {!!taskId
          ? (
            <>
              <Heading>In progress.</Heading>
              <Text fontSize='md'>👉 Chat msg discussion?</Text>
            </>
          ) : <Heading>No content.</Heading>}
        </TabPanel>
        <TabPanel>
          <Heading>In progress.</Heading>
          <Text fontSize='md'>👉 room News content?</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
})
