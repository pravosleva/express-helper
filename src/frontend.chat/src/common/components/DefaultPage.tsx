import { IconButton } from '@chakra-ui/react'
import { BiArrowBack } from 'react-icons/bi'
import { useHistory } from 'react-router-dom'

export function DefaultPage() {
    const history = useHistory()
    const redirect = () => history.push('/')

    return (
        <div>
            <IconButton mr={2} isRound aria-label='icon-btn' bg='green.300' color='white' icon={<BiArrowBack />} onClick={redirect} /> You're lost. Go home.
        </div>
    )
}