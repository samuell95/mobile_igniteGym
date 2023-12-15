import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { Box, useTheme } from 'native-base'
import { AuthRoutes } from './auth.routes'
import { AppRoutes } from './app.routes'
import { useAuth } from '@hooks/useAuth'
import { Loading } from '@components/Loading'

export function Routes() {
  const { colors } = useTheme()
  const { user, isLoadingUserStorageData } = useAuth()
  const theme = DefaultTheme

  if (isLoadingUserStorageData) {
    return <Loading />
  }
  theme.colors.background = colors.gray[700]
  return (
    <Box flex={1} background={'gray.700'}>
      <NavigationContainer>
        {user.id ? <AppRoutes /> : <AuthRoutes />}
      </NavigationContainer>
    </Box>
  )
}
