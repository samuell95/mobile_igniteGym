import { useNavigation } from '@react-navigation/native'
import {
  VStack,
  Image,
  Text,
  Center,
  Heading,
  ScrollView,
  useToast,
} from 'native-base'
import BgImg from '@assets/background.png'
import LogoSvg from '@assets/logo.svg'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { AppError } from '@utils/AppError'
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'

const FormDataSchema = z
  .object({
    name: z
      .string()
      .nonempty({ message: 'Digite seu nome' })
      .min(6, { message: 'Escreva seu nome e sobrenome' }),
    email: z.string().email({ message: 'E-mail invalido' }),
    password: z
      .string()
      .nonempty({ message: 'Digite sua senha' })
      .min(6, { message: 'Digite sua senha, no mínimo de 6 caracteres' }),
    password_confirm: z
      .string()
      .nonempty({ message: 'Digite a novamente a senha' })
      .min(6, { message: 'Digite sua senha de 6 caracteres' }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Senhas diferentes',
    path: ['password_confirm'],
  })
  .refine(
    (data) => {
      // Validação personalizada para o campo 'name'
      const nameParts = data.name.split(' ')

      // Verifica se há pelo menos um nome e um sobrenome
      return nameParts.length >= 2
    },
    {
      message: 'Informe seu nome completo (nome e sobrenome)',
      path: ['name'],
    },
  )

type MainFormData = z.infer<typeof FormDataSchema>

export function SignUp() {
  const [isLoading, setisLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MainFormData>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      password_confirm: '',
    },
  })

  const navigation = useNavigation()

  function handleGoBack() {
    navigation.goBack()
  }

  async function handleSignUp({ email, name, password }: MainFormData) {
    try {
      setisLoading(true)

      await api.post('/users', {
        name,
        email,
        password,
      })

      await signIn(email, password)
    } catch (error) {
      setisLoading(false)

      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível criar conta. Tente novamente mais tarde'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10}>
        <Image
          source={BgImg}
          alt=""
          resizeMode="contain"
          position="absolute"
          defaultSource={BgImg}
        />

        <Center my={24}>
          <LogoSvg />

          <Text color={'gray.100'} fontSize={'sm'}>
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading
            color={'gray.100'}
            fontSize={'xl'}
            mb={6}
            fontFamily={'heading'}
          >
            Crie sua conta
          </Heading>

          <Controller
            name="name"
            rules={{
              required: 'Digite seu Nome',
            }}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="nome e sobrenome"
                onChangeText={onChange}
                value={value}
                errorMessagem={errors.name?.message?.concat(' ❌')}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessagem={errors.email?.message?.concat(' ❌')}
              />
            )}
          />
          <Controller
            name="password"
            rules={{
              required: 'Digite sua senha',
            }}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessagem={errors.password?.message?.concat(' ❌')}
              />
            )}
          />

          <Controller
            name="password_confirm"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirme sua senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessagem={errors.password_confirm?.message?.concat(' ❌')}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
              />
            )}
          />

          <Button
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoading}
          />
        </Center>

        <Button
          title="Voltar ao login"
          variant={'outline'}
          mt={16}
          onPress={handleGoBack}
        />
      </VStack>
    </ScrollView>
  )
}
