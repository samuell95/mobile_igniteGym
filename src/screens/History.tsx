import { HistoryCard } from '@components/HistoryCard'
import { ScreenHeader } from '@components/ScreenHeader'
import { AppError } from '@utils/AppError'
import { Heading, SectionList, VStack, Text, useToast } from 'native-base'
import { useCallback, useState } from 'react'
import { api } from '../lib/api'
import { useFocusEffect } from '@react-navigation/native'
import { HistoryByDayDTO } from '@dtos/HistoryGroupByDayDTO'
import { Loading } from '@components/Loading'

export function History() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [exercise, setExercise] = useState<HistoryByDayDTO[]>([])

  async function fetchHistory() {
    try {
      setIsLoading(true)
      const response = await api.get('/history')
      setExercise(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar o histórico.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchHistory()
    }, []),
  )
  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />

      {isLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={exercise}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryCard data={item} />}
          renderSectionHeader={({ section }) => (
            <Heading
              color={'gray.200'}
              fontSize={'md'}
              fontFamily={'heading'}
              mt={10}
              mb={3}
            >
              {section.title}
            </Heading>
          )}
          px={8}
          contentContainerStyle={
            exercise.length === 0 && { flex: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={() => (
            <Text color={'gray.100'} textAlign={'center'}>
              Não há registros de exercícios. {'\n'}
              Vamos começar a treinar agora!?💪🎶
            </Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </VStack>
  )
}
