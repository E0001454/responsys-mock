import { computed, ref, watch } from 'vue'

interface Option {
  label: string
  value: number
}

export interface MapeoLineaFormData {
  idABCCatLineaNegocio?: number | ''
  nombre: string
  descripcion: string
  validar?: boolean
  enviar?: boolean
  porcentajeError?: number | ''
  dictaminar?: boolean
  idUsuario?: number | ''
}

export interface UseMapeoLineaModalProps {
  show: boolean
  mode: 'add' | 'edit'
  lineasDisponibles: Option[]
  existingMapeos: { idABCConfigMapeoLinea?: number; nombre?: string }[]
  initialData?: Record<string, any> | null
  isLoading?: boolean
}

interface UseMapeoLineaModalEmit {
  (e: 'save', data: MapeoLineaFormData): void
  (e: 'close'): void
}

export function useMapeoLineaModal(
  props: UseMapeoLineaModalProps,
  emit: UseMapeoLineaModalEmit
) {
  const formData = ref<MapeoLineaFormData>(initializeFormData())
  const initialFormSnapshot = ref('')
  const showActionConfirm = ref(false)
  const pendingAction = ref<'save' | 'cancel' | null>(null)
  const touchedFields = ref({
    nombre: false,
    descripcion: false,
    porcentajeError: false
  })

  const isEditing = computed(() => props.mode === 'edit')

  const normalizeName = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const isDuplicateName = computed(() => {
    if (isEditing.value) return false
    const name = normalizeName(formData.value.nombre || '')
    if (!name) return false
    return props.existingMapeos.some(item => normalizeName(item.nombre || '') === name)
  })

  const nombreLength = computed(() => String(formData.value.nombre ?? '').trim().length)
  const descripcionLength = computed(() => String(formData.value.descripcion ?? '').trim().length)

  const nombreLengthError = computed(() => {
    if (!nombreLength.value) return 'El nombre es obligatorio.'
    if (nombreLength.value < 3 || nombreLength.value > 30) {
      return 'El nombre debe tener entre 3 y 30 caracteres.'
    }
    return ''
  })

  const descripcionLengthError = computed(() => {
    if (!descripcionLength.value) return 'La descripción es obligatoria.'
    if (descripcionLength.value < 3 || descripcionLength.value > 100) {
      return 'La descripción debe tener entre 3 y 100 caracteres.'
    }
    return ''
  })

  const porcentajeErrorValidationMessage = computed(() => {
    const value = formData.value.porcentajeError
    if (value === '' || value === null || value === undefined) return ''
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return 'El porcentaje de error debe ser un número entre 0 y 100.'
    if (numeric < 0 || numeric > 100) return 'El porcentaje de error debe estar entre 0 y 100.'
    return ''
  })

  const hasTextValidationError = computed(() => Boolean(nombreLengthError.value || descripcionLengthError.value))
  const hasPorcentajeErrorValidation = computed(() => Boolean(porcentajeErrorValidationMessage.value))
  const showNombreLengthError = computed(() => touchedFields.value.nombre && Boolean(nombreLengthError.value))
  const showDescripcionLengthError = computed(() => touchedFields.value.descripcion && Boolean(descripcionLengthError.value))
  const showPorcentajeErrorValidation = computed(
    () => touchedFields.value.porcentajeError && Boolean(porcentajeErrorValidationMessage.value)
  )

  const isDirty = computed(() => serializeFormState(formData.value) !== initialFormSnapshot.value)
  const confirmTitle = computed(() => (pendingAction.value === 'save' ? 'Confirmar guardado' : 'Descartar cambios'))
  const confirmMessage = computed(() =>
    pendingAction.value === 'save'
      ? '¿Estás seguro de guardar los cambios de este registro?'
      : 'Se detectaron cambios sin guardar. ¿Deseas cancelar y descartar la información modificada?'
  )
  const confirmText = computed(() => (pendingAction.value === 'save' ? 'Aceptar' : 'Aceptar'))
  const confirmCancelText = computed(() => 'Cancelar')

  watch(
    () => [props.initialData, props.mode],
    () => {
      setInitialFormState()
    }
  )

  watch(
    () => props.show,
    (isOpen) => {
      if (isOpen) {
        setInitialFormState()
      }
    }
  )

  watch(
    () => formData.value.porcentajeError,
    value => {
      if (value === '' || value === null || value === undefined) return
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) {
        formData.value.porcentajeError = ''
        return
      }
      const normalized = Math.max(0, Math.min(100, Math.trunc(numeric)))
      if (normalized !== numeric) {
        formData.value.porcentajeError = normalized
      }
    }
  )

  function initializeFormData(): MapeoLineaFormData {
    if (props.initialData) {
      const lineaId = props.initialData.linea?.id ?? props.initialData.idABCCatLineaNegocio ?? ''
      return {
        idABCCatLineaNegocio: lineaId,
        nombre: props.initialData.nombre ?? '',
        descripcion: props.initialData.descripcion ?? '',
        validar: props.initialData.validar ?? props.initialData.valida ?? true,
        enviar: props.initialData.enviar ?? props.initialData.envio ?? true,
        porcentajeError:
          props.initialData.porcentajeError === null || props.initialData.porcentajeError === undefined
            ? ''
            : Number(props.initialData.porcentajeError),
        dictaminar:
          props.initialData.dictaminar ?? props.initialData.bolDictaminacion ?? true,
        idUsuario: props.initialData.idUsuario ?? props.initialData.idABCUsuario ?? 1
      }
    }

    return {
      idABCCatLineaNegocio: '',
      nombre: '',
      descripcion: '',
      validar: true,
      enviar: true,
      porcentajeError: '',
      dictaminar: true,
      idUsuario: 1
    }
  }

  function serializeFormState(value: MapeoLineaFormData) {
    return JSON.stringify(value)
  }

  function setInitialFormState() {
    formData.value = initializeFormData()
    touchedFields.value = {
      nombre: false,
      descripcion: false,
      porcentajeError: false
    }
    initialFormSnapshot.value = serializeFormState(formData.value)
  }

  function restoreInitialInformation() {
    formData.value = initializeFormData()
    touchedFields.value = {
      nombre: false,
      descripcion: false,
      porcentajeError: false
    }
  }

  function closeActionConfirm() {
    showActionConfirm.value = false
    pendingAction.value = null
  }

  function requestSave() {
    if (isEditing.value) {
      pendingAction.value = 'save'
      showActionConfirm.value = true
      return
    }

    if (isDuplicateName.value || hasTextValidationError.value || hasPorcentajeErrorValidation.value) {
      touchedFields.value.nombre = true
      touchedFields.value.descripcion = true
      touchedFields.value.porcentajeError = true
      return
    }

    emit('save', formData.value)
  }

  function requestCancel() {
    if (isEditing.value && isDirty.value) {
      pendingAction.value = 'cancel'
      showActionConfirm.value = true
      return
    }

    emit('close')
  }

  function confirmAction() {
    if (pendingAction.value === 'save') {
      if (isDuplicateName.value || hasTextValidationError.value || hasPorcentajeErrorValidation.value) {
        touchedFields.value.nombre = true
        touchedFields.value.descripcion = true
        touchedFields.value.porcentajeError = true
        closeActionConfirm()
        return
      }

      emit('save', formData.value)
    } else if (pendingAction.value === 'cancel') {
      emit('close')
    }

    closeActionConfirm()
  }

  function handleSave() {
    requestSave()
  }

  return {
    formData,
    touchedFields,
    isEditing,
    isDuplicateName,
    showNombreLengthError,
    showDescripcionLengthError,
    showPorcentajeErrorValidation,
    nombreLengthError,
    descripcionLengthError,
    porcentajeErrorValidationMessage,
    showActionConfirm,
    confirmTitle,
    confirmMessage,
    confirmText,
    confirmCancelText,
    restoreInitialInformation,
    requestCancel,
    handleSave,
    confirmAction,
    closeActionConfirm
  }
}
