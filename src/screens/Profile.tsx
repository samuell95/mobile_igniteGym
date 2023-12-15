import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import defaultUserPhotoImg from '@assets/userPhotoDefault.png'
import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import {
  Center,
  ScrollView,
  VStack,
  Skeleton,
  Text,
  Heading,
  useToast,
} from 'native-base'
import { TouchableOpacity } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@hooks/useAuth'
import { api } from '../lib/api'
import { AppError } from '@utils/AppError'

type FormDataProps = {
  name: string
  email: string
  old_password: string
  password: string
  confirm_password: string
}

const ProfileSchema = z
  .object({
    name: z.string().nonempty({ message: 'Nome obrigatório.' }),
    email: z.string(),
    old_password: z.string().nullable().optional(),
    password: z
      .string()
      .optional()
      .nullable()
      .transform((value) => (value === null || value === '' ? null : value))
      .refine(
        (value) => value === null || (value !== undefined && value.length >= 6),
        {
          message: 'A senha tem que ter no mínimo 6 caracteres',
        },
      ),
    confirm_password: z
      .string()
      .optional()
      .nullable()
      .transform((value) => (value === null || value === '' ? null : value)),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'A confirmação de senha não conferem ',
    path: ['confirm_password'],
  })

export function Profile() {
  const [isUpdate, setIsUpdate] = useState(false)
  const [photoIsLoading, setphotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState()

  const toast = useToast()
  const { user, UpdateUserProfile } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: zodResolver(ProfileSchema),
  })

  async function handleUserPhotoSelect() {
    setphotoIsLoading(true)
    try {
      const photoResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoResult.canceled) {
        return
      }

      if (photoResult.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoResult.assets[0].uri,
          { size: true },
        )
        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title:
              'Sua imagem ultrapassou os 5mb requerido. Escolha uma válida',
            placement: 'top',
            bgColor: 'red.500',
          })
        }
        const fileExtension = photoResult.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLocaleLowerCase(),
          uri: photoInfo.uri,
          type: `${photoResult.assets[0].type}/${fileExtension}`,
        } as any

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdateResponse = await api.patch(
          '/users/avatar',
          userPhotoUploadForm,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        const userUpdate = user
        userUpdate.avatar = avatarUpdateResponse.data.avatar
        UpdateUserProfile(userUpdate)

        toast.show({
          title: 'Foto atualizada com sucesso! ✅',
          placement: 'top',
          bgColor: 'green.500',
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setphotoIsLoading(false)
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdate(true)
      const userUpdated = user
      userUpdated.name = data.name
      await api.put('/users', data)

      await UpdateUserProfile(userUpdated)
      toast.show({
        title: 'Perfil atualizado com sucesso!✅',
        placement: 'top',
        bgColor: 'green.500',
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível atualizar os dados, Tente mais tarde ⚠️'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsUpdate(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {photoIsLoading ? (
            <Skeleton
              w={33}
              h={33}
              rounded={'full'}
              startColor={'gray.500'}
              endColor={'gray.400'}
            />
          ) : (
            <UserPhoto
              alt={'Imagem do usuário'}
              size={33}
              source={
                user.avatar
                  ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                  : defaultUserPhotoImg
              }
              mr={4}
            />
          )}

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color={'green.500'}
              fontWeight={'bold'}
              fontSize={'md'}
              mt={2}
              mb={8}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            name="name"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nome"
                value={value}
                onChangeText={onChange}
                errorMessagem={errors.name?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="E-mail"
                isDisabled
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </Center>

        <Center px={10} mt={12} mb={9}>
          <Heading
            color={'gray.200'}
            fontSize={'md'}
            fontFamily={'heading'}
            mb={2}
            mt={12}
            alignSelf={'flex-start'}
          >
            Alterar senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Antiga senha"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessagem={errors.password && errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessagem={
                  errors.confirm_password && errors.confirm_password?.message
                }
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdate}
          />
        </Center>
      </ScrollView>
    </VStack>
  )
}
