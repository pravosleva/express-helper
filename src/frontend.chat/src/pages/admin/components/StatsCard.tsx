import {
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';

interface StatsCardProps {
  title: string;
  renderer: React.FC<any>;
}

export function StatsCard(props: StatsCardProps) {
  const { title, renderer } = props;
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.800', 'gray.500')}
      rounded={'lg'}
    >
      <StatLabel fontWeight={'medium'} isTruncated>
        {title}
      </StatLabel>
      <StatNumber
        fontSize={'sm'}
        fontWeight={'medium'}
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {renderer({})}
      </StatNumber>
    </Stat>
  );
}