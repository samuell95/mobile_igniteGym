import {
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  Image,
  Box,
  ScrollView,
  useToast,
} from 'native-base'
import { TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigationRoutesProps } from '@routes/app.routes'
import BodySVG from '@assets/body.svg'
import SeriesSVG from '@assets/series.svg'
import RepetitionsSVG from '@assets/repetitions.svg'
import { Button } from '@components/Button'
import { AppError } from '@utils/AppError'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'
import { ExerciseDTO } from '@dtos/ExerciseDTO'
import { Loading } from '@components/Loading'

type RouteParamsProps = {
  exerciseId: string
}

export function Exercise() {
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)
  const [isLoading, setIsLoading] = useState(true)
  const [sendingRegister, setSendingRegister] = useState(false)
  const navigation = useNavigation<AppNavigationRoutesProps>()
  const route = useRoute()
  const toast = useToast()

  const { exerciseId } = route.params as RouteParamsProps

  function handleGoBack() {
    navigation.goBack()
  }

  async function fetchExercisesDetails() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/${exerciseId}`)
      setExercise(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar os detalhes do exercício.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExerciseHistoryRegister() {
    try {
      setSendingRegister(true)

      api.post('/history', { exercise_id: exerciseId })

      toast.show({
        title: 'Parabéns! Seu exercício foi registrado com sucesso🎉🎉',
        placement: 'top',
        bgColor: 'green.700',
      })

      navigation.navigate('history')
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível registrar o  exercício.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setSendingRegister(false)
    }
  }

  useEffect(() => {
    fetchExercisesDetails()
  }, [exerciseId])

  return (
    <VStack flex={1}>
      <VStack px={8} bg={'gray.600'} pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={Feather} name="arrow-left" color={'green.500'} size={6} />
        </TouchableOpacity>

        <HStack
          justifyContent={'space-between'}
          mt={4}
          mb={8}
          alignItems={'center'}
        >
          <Heading
            color={'gray.100'}
            fontSize={'lg'}
            fontFamily={'heading'}
            flexShrink={1}
          >
            {exercise.name}
          </Heading>

          <HStack>
            <BodySVG />
            <Text color={'gray.200'} textTransform={'capitalize'}>
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
        <VStack p={8} mt={8}>
          <Box rounded={'lg'} mb={3} overflow={'hidden'}>
            <Image
              w={'full'}
              h={80}
              resizeMode="cover"
              rounded={'lg'}
              overflow={'hidden'}
              source={{
                uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`,
              }}
              alt="Imagem do exercício"
            />
          </Box>

          <Box bg={'gray.600'} rounded={'md'} pb={4} px={4}>
            <HStack
              alignItems={'center'}
              justifyContent={'space-around'}
              mb={6}
              mt={5}
            >
              <HStack>
                <SeriesSVG />
                <Text color={'gray.200'} ml={2}>
                  {exercise.series} séries
                </Text>
              </HStack>
              <HStack>
                <RepetitionsSVG />
                <Text color={'gray.200'} ml={2}>
                  {exercise.repetitions} repetições
                </Text>
              </HStack>
            </HStack>

            <Button
              title="Marcar como realizado"
              isLoading={sendingRegister}
              onPress={handleExerciseHistoryRegister}
            />
          </Box>
        </VStack>
      )}
    </VStack>
  )
}
