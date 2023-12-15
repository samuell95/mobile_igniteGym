import { StatusBar } from 'expo-status-bar'
import { NativeBaseProvider } from 'native-base'
import { THEME } from './src/theme'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'
import { Loading } from '@components/Loading'
import { Routes } from './src/routes'
import { AuthContextProvider } from '@contexts/AuthContext'

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  })
  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
      <StatusBar backgroundColor="transparent" style="inverted" translucent />
    </NativeBaseProvider>
  )
}
