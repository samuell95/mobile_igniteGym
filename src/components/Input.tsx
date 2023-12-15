import { Input as NativeBaseInput, IInputProps, FormControl } from 'native-base'

type Props = IInputProps & {
  errorMessagem?: string | null
}

export function Input({ errorMessagem = null, isInvalid, ...rest }: Props) {
  const isvalid = !!errorMessagem || isInvalid

  return (
    <FormControl isInvalid={isvalid} mb={4}>
      <NativeBaseInput
        bg={'gray.700'}
        h={14}
        px={4}
        borderWidth={0}
        fontSize={'md'}
        color={'white'}
        fontFamily={'body'}
        placeholderTextColor={'gray.300'}
        isInvalid={isvalid}
        _invalid={{
          borderWidth: 1,
          borderColor: 'red.500',
        }}
        _focus={{
          bg: 'gray.700',
          borderWidth: 1,
          borderColor: 'green.500',
        }}
        {...rest}
      />
      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessagem}
      </FormControl.ErrorMessage>
    </FormControl>
  )
}
